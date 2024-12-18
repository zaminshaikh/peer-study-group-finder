// lib/auth/signup_page.dart
import 'package:flutter/material.dart';
import 'package:mobile/auth/components/verify_email.dart';
import '../components/custom_text_field.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/models/user_model.dart';

class SignUpPage extends StatefulWidget {
  const SignUpPage({Key? key}) : super(key: key);
  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  final nameController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  bool isSubmitting = false;

  void handleSignUp() async {
    const String apiUrl = 'http://studyhive.me:5000/api/register';

    final Map<String, dynamic> requestBody = {
      'FirstName': nameController.text.split(' ').first,
      'LastName': nameController.text.contains(' ')
          ? nameController.text.split(' ').last
          : '',
      'DisplayName': nameController.text,
      'Email': emailController.text,
      'Password': passwordController.text,
    };

    setState(() => isSubmitting = true);

    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(requestBody),
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        debugPrint('Parsed Response Data: $responseData');

        if (responseData['error'] == '') {
          debugPrint(
              'Registration successful for email: ${emailController.text}');
          // Registration successful
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text(
                    'Registration successful. A verification code has been sent to your email.')),
          );
          
          // Create User object from response
          User user = User.fromJson({
            'UserId': responseData['UserId'],
            'FirstName': responseData['FirstName'],
            'LastName': responseData['LastName'],
            'DisplayName': responseData['DisplayName'],
            'Email': responseData['Email'],
            'Group': responseData['Group'] != null
                ? List<int>.from(responseData['Group'])
                : [],
          });

          // Serialize User object to JSON string
          String userJson = jsonEncode(user.toJson());

          // Store the User JSON string in Shared Preferences
          SharedPreferences prefs = await SharedPreferences.getInstance();
          await prefs.setString('user', userJson);

          // Navigate to the verification screen
          await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const VerifyEmailPage()),
          );
        } else {
          debugPrint(
              'Registration failed with error: ${responseData['error']}');
          // Show error message from the server
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(responseData['error'])),
          );
        }
      } else {
        debugPrint(
            'Server returned an error. Status Code: ${response.statusCode}');
        // Handle server error
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Server error. Please try again later.')),
        );
      }
    } catch (e) {
      debugPrint('Network error occurred: $e');
      // Handle network error
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Network error. Please check your connection.')),
      );
    } finally {
      setState(() => isSubmitting = false);
    }
  }

  @override
  void dispose() {
    // Dispose controllers when the widget is removed
    nameController.dispose();
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final headlineStyle = Theme.of(context).textTheme.headlineSmall;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sign Up'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding:
              const EdgeInsets.symmetric(horizontal: 32.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Create Account', style: headlineStyle),
              const SizedBox(height: 32),
              CustomTextField(
                controller: nameController,
                hintText: 'Full Name',
                icon: Icons.person_outline,
              ),
              const SizedBox(height: 16),
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
              isSubmitting
                  ? const Center(child: CircularProgressIndicator())
                  : ElevatedButton(
                      onPressed: handleSignUp,
                      child: const Text('Sign Up'),
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size.fromHeight(50),
                      ),
                    ),
              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/login');
                  },
                  child: const Text('Already have an account? Login'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}