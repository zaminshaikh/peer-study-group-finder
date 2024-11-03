// lib/main.dart
import 'package:flutter/material.dart';
import 'package:mobile/auth/login.dart';
import 'package:mobile/auth/onboarding.dart';
import 'package:mobile/auth/sign_up.dart';

void main() {
  runApp(const PeerStudyGroupFinderApp());
}

class PeerStudyGroupFinderApp extends StatelessWidget {
  const PeerStudyGroupFinderApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Peer Study Group Finder',
      theme: ThemeData.dark(),
      initialRoute: '/',
      routes: {
        '/': (context) => const OnboardingPage(),
        '/signup': (context) => const SignUpPage(),
        '/login': (context) => const LoginPage(),
      },
    );
  }
}