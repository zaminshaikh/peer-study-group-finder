// lib/auth/login_page.dart
import 'package:flutter/material.dart';
import 'package:mobile/components/custom_text_field.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';


class LoginPage extends StatefulWidget {
  const LoginPage({Key? key}) : super(key: key);
  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  void handleLogin() async {
    const String apiUrl = 'http://10.0.2.2:8000/api/login';

    final Map<String, dynamic> requestBody = {
      'Email': emailController.text,
      'Password': passwordController.text,
    };

    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(requestBody),
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);

        if (responseData['error'] == '') {
          // Login successful
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Login successful')),
          );

          // Store userId for later use
          int userId = responseData['id'];
          SharedPreferences prefs = await SharedPreferences.getInstance();
          await prefs.setInt('userId', userId);

          // Navigate to the dashboard
          Navigator.pushNamed(context, '/dashboard');
        } else {
          // Show error message from the server
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(responseData['error'])),
          );
        }
      } else {
        // Handle server error
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Server error. Please try again later.')),
        );
      }
    } catch (e) {
      // Handle network error
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Network error. Please check your connection.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final headlineStyle = Theme.of(context).textTheme.displayLarge;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Login'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding:
              const EdgeInsets.symmetric(horizontal: 32.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Welcome Back', style: headlineStyle),
              const SizedBox(height: 32),
              CustomTextField(
                controller: emailController,
                hintText: 'Email Address',
                icon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: passwordController,
                hintText: 'Password',
                icon: Icons.lock_outline,
                obscureText: true,
              ),
              const SizedBox(height: 16),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () {
                    // Implement password reset
                  },
                  child: const Text('Forgot Password?'),
                ),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: handleLogin,
                child: const Text('Login'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(50),
                ),
              ),
              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/signup');
                  },
                  child: const Text("Don't have an account? Sign Up"),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}