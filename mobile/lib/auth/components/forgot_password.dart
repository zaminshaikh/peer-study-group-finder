// lib/auth/forgot_password.dart

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({Key? key}) : super(key: key);

  @override
  ForgotPasswordPageState createState() => ForgotPasswordPageState();
}

class ForgotPasswordPageState extends State<ForgotPasswordPage> {
  // Step Tracking: 1 = Request Reset, 2 = Verify Code & Reset Password
  int _currentStep = 1;

  // Controllers for Step 1
  final emailController = TextEditingController();

  // Controllers for Step 2
  final codeController = TextEditingController();
  final newPasswordController = TextEditingController();
  final confirmNewPasswordController = TextEditingController();

  // Loading States
  bool isSubmitting = false;

  // Temporary storage for UserId
  int? userId;

  // Function to request password reset
  void requestPasswordReset() async {
    final String apiUrl = 'http://10.0.2.2:8000/api/forgotpasswordverification';
    final String email = emailController.text.trim();

    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your email address')),
      );
      return;
    }

    setState(() {
      isSubmitting = true;
    });

    final Map<String, dynamic> requestBody = {
      'Email': email,
    };

    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(requestBody),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        if (responseData['error'] == '') {
          setState(() {
            userId = responseData['UserId'];
            _currentStep = 2;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Verification code sent to your email')),
          );
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
        isSubmitting = false;
      });
    }
  }

  // Function to reset password
  void resetPassword() async {
    final String apiUrl = 'http://10.0.2.2:8000/api/changepassword';
    final String code = codeController.text.trim();
    final String newPassword = newPasswordController.text.trim();
    final String confirmNewPassword = confirmNewPasswordController.text.trim();

    if (code.isEmpty || newPassword.isEmpty || confirmNewPassword.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }

    if (newPassword != confirmNewPassword) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Passwords do not match')),
      );
      return;
    }

    if (userId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid session. Please try again.')),
      );
      return;
    }

    setState(() {
      isSubmitting = true;
    });

    final Map<String, dynamic> requestBody = {
      'UserId': userId,
      'Password': newPassword,
      'InputVerificationCode': int.tryParse(code) ?? 0,
    };

    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(requestBody),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        if (responseData['error'] == null || responseData['error'] == '') {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Password reset successful. Please login.')),
          );
          Navigator.pop(context); // Navigate back to login page
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(responseData['error'])),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Password is the same as the current password.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Network error. Please check your connection.')),
      );
    } finally {
      setState(() {
        isSubmitting = false;
      });
    }
  }

  @override
  void dispose() {
    emailController.dispose();
    codeController.dispose();
    newPasswordController.dispose();
    confirmNewPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Forgot Password'),
        centerTitle: true,
      ),
      body: isSubmitting
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: _currentStep == 1 ? _buildRequestReset() : _buildResetPassword(),
            ),
    );
  }

  // Widget for Step 1: Request Password Reset
  Widget _buildRequestReset() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Reset Your Password',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 20),
        TextFormField(
          controller: emailController,
          decoration: const InputDecoration(
            labelText: 'Email Address',
            border: OutlineInputBorder(),
            prefixIcon: Icon(Icons.email_outlined),
          ),
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: requestPasswordReset,
            child: const Text('Send Verification Code'),
          ),
        ),
      ],
    );
  }

  // Widget for Step 2: Verify Code & Reset Password
  Widget _buildResetPassword() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Enter Verification Code and New Password',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          TextFormField(
            controller: codeController,
            decoration: const InputDecoration(
              labelText: 'Verification Code',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.security_outlined),
            ),
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 20),
          TextFormField(
            controller: newPasswordController,
            decoration: const InputDecoration(
              labelText: 'New Password',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.lock_outline),
            ),
            obscureText: true,
          ),
          const SizedBox(height: 20),
          TextFormField(
            controller: confirmNewPasswordController,
            decoration: const InputDecoration(
              labelText: 'Confirm New Password',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.lock_outline),
            ),
            obscureText: true,
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: resetPassword,
              child: const Text('Reset Password'),
            ),
          ),
          const SizedBox(height: 10),
          TextButton(
            onPressed: () {
              setState(() {
                _currentStep = 1;
                emailController.clear();
                codeController.clear();
                newPasswordController.clear();
                confirmNewPasswordController.clear();
              });
            },
            child: const Text('Back to Email Input'),
          ),
        ],
      ),
    );
  }
}