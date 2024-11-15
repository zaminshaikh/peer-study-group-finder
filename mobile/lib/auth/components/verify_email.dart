// lib/pages/verify_email.dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

class VerifyEmailPage extends StatefulWidget {
  const VerifyEmailPage({Key? key}) : super(key: key);

  @override
  VerifyEmailPageState createState() => VerifyEmailPageState();
}

class VerifyEmailPageState extends State<VerifyEmailPage> {
  final codeController = TextEditingController();
  bool isSubmitting = false;

  void verifyEmail() async {
    setState(() => isSubmitting = true);

    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final int? userId = prefs.getInt('userId');

    if (userId == null) {
      // Handle missing email
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No User ID found. Please register again.')),
      );
      return;
    }

    final apiUrl = 'http://10.0.2.2:8000/api/verifyemail';
    final requestBody = {
      'UserId': userId,
      'InputVerificationCode': int.parse(codeController.text.trim()),
    };

    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(requestBody),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200 && responseData['error'] == '') {
        // Verification successful
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Email verified successfully!')),
        );

        // Navigate to dashboard
        Navigator.pushNamedAndRemoveUntil(context, '/dashboard', (route) => false);
      } else {
        // Verification failed
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(responseData['error'] ?? 'Verification failed.')),
        );
      }
    } catch (e) {
      // Network error
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Network error. Please check your connection.')),
      );
    } finally {
      setState(() => isSubmitting = false);
    }
  }

  void resendVerificationCode() async {
    setState(() => isSubmitting = true);

    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final int? userId = prefs.getInt('userId');

    if (userId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No userId found. Please register again.')),
      );
      return;
    }

    final apiUrl = 'http://10.0.2.2:8000/api/resendverificationemail';
    final requestBody = {
      'UserId': userId,
    };

    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(requestBody),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200 && responseData['error'] == '') {
        // Resent successfully
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Verification code resent to your email.')),
        );
      } else {
        // Resend failed
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(responseData['error'] ?? 'Failed to resend code.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Network error. Please check your connection.')),
      );
    } finally {
      setState(() => isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text('Verify Your Email'),
        ),
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              const Text(
                'A verification code has been sent to your email. Please enter it below to verify your account.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              TextFormField(
                controller: codeController,
                decoration: const InputDecoration(
                  labelText: 'Verification Code',
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 20),
              isSubmitting
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: verifyEmail,
                      child: const Text('Verify Email'),
                    ),
              TextButton(
                onPressed: resendVerificationCode,
                child: const Text('Resend Code'),
              ),
            ],
          ),
        ));
  }
}