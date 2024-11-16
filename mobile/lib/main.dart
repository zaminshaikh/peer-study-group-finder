// lib/main.dart

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/auth/components/forgot_password.dart';
import 'package:mobile/dashboard/dashboard.dart';

import 'auth/login.dart';
import 'auth/onboarding.dart';
import 'auth/sign_up.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  runApp(const StudyHiveApp());
}

class StudyHiveApp extends StatelessWidget {
  const StudyHiveApp({Key? key}) : super(key: key);

  // Function to determine the initial screen
  Future<Widget> _getInitialPage() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    if (prefs.containsKey('user')) {
      return DashboardPage(); // Ensure DashboardPage is a StatefulWidget without const
    } else {
      return const OnboardingPage(); // Assuming OnboardingPage is a StatelessWidget or StatefulWidget with const constructor
    }
  }

  @override
  Widget build(BuildContext context) {
    final baseTextTheme = Theme.of(context).textTheme;

    return MaterialApp(
      title: 'StudyHive',
      theme: ThemeData(
        brightness: Brightness.light,
        primaryColor: Colors.teal,
        scaffoldBackgroundColor: Colors.white,
        textTheme: GoogleFonts.montserratTextTheme(baseTextTheme).copyWith(
          displayLarge: GoogleFonts.montserrat(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
          bodyLarge: const TextStyle(
            fontSize: 16,
            color: Colors.black87,
          ),
          labelLarge: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        colorScheme: ColorScheme.fromSwatch().copyWith(
          secondary: Colors.tealAccent,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.teal,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: Colors.teal,
            textStyle: const TextStyle(fontSize: 16),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.grey[200],
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide.none,
          ),
          hintStyle: TextStyle(color: Colors.grey[600]),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0,
          iconTheme: IconThemeData(color: Colors.teal),
          titleTextStyle: TextStyle(
            color: Colors.teal,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      // Use FutureBuilder to determine the initial screen
      home: FutureBuilder<Widget>(
        future: _getInitialPage(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            // Loading indicator while determining the initial screen
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          } else if (snapshot.hasError) {
            // Display error if any
            return Scaffold(
              body: Center(child: Text('Error: ${snapshot.error}')),
            );
          } else {
            // Show the appropriate initial screen
            return snapshot.data!;
          }
        },
      ),
      routes: {
        '/signup': (context) => SignUpPage(), // Ensure SignUpPage is Stateless or Stateful without const
        '/login': (context) => LoginPage(), // Ensure LoginPage is Stateless or Stateful without const
        '/dashboard': (context) => DashboardPage(), // Ensure DashboardPage is Stateful without const
        '/forgot_password': (context) => const ForgotPasswordPage(), // Register ForgotPasswordPage
      },
    );
  }
}