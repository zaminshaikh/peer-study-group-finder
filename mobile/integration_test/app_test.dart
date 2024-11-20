import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';
import 'package:mobile/dashboard/components/group_card.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('end-to-end test', () {
    testWidgets('See landing page, login, fetch groups, logout, see landing page',
        (tester) async {

      await tester.pumpWidget(const StudyHiveApp());

      await tester.pumpAndSettle();

      final loginStartFinder = find.byType(TextButton);
      expect(loginStartFinder, findsOne); // Confirms landing page is present

      await tester.tap(loginStartFinder);

      await tester.pumpAndSettle();

      final emailFinder = find.byKey(const Key("emailField"));
      await tester.enterText(emailFinder, 'rickL4331@gmail.com');
     
      final passwordFinder = find.byKey(const Key("passwordField"));
      await tester.enterText(passwordFinder, 'Paradise43!!');

      final loginSubmitFinder = find.byType(ElevatedButton);
      await tester.tap(loginSubmitFinder);

      await tester.pumpAndSettle();

      final listFinder = find.byType(ListView);
      expect(listFinder, findsAny); // Confirms login was successful, goes to dashboard page, groups are loaded

      await tester.pumpAndSettle();

      final logoutButtonFinder = find.byKey(Key('logoutButton'));
      await tester.tap(logoutButtonFinder);

      await tester.pumpAndSettle();

      final landingFinder = find.text('Welcome to StudyHive');
      expect(landingFinder, findsOne); // Confirms logout was successful, and boots to landing page
    });
  });
}