// lib/auth/login_page.dart

import 'package:flutter/material.dart';
import 'package:mobile/components/custom_text_field.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/models/user_model.dart';
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
  bool isLoading = false;

  void handleLogin() async {
    const String apiUrl = 'http://10.0.2.2:8000/api/login';

    final Map<String, dynamic> requestBody = {
      'Email': emailController.text.trim(),
      'Password': passwordController.text,
    };

    setState(() {
      isLoading = true;
    });

    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(requestBody),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        if (responseData['error'] == '') {
          User user = User.fromJson(responseData['user']);
          String userJson = jsonEncode(user.toJson());
          SharedPreferences prefs = await SharedPreferences.getInstance();
          await prefs.setString('user', userJson);
          Navigator.pushNamedAndRemoveUntil(context, '/dashboard', (route) => false);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(responseData['error'])),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Server error. Please try again later.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Network error. Please check your connection.')),
      );
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final headlineStyle = Theme.of(context).textTheme.headlineSmall;

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
              const SizedBox(height: 32),
              isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : ElevatedButton(
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
                    Navigator.pushNamed(context, '/forgot_password');
                  },
                  child: const Text('Forgot Password?'),
                ),
              ),
              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/signup');
                  },
                  child: const Text('Don\'t have an account? Sign Up'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}