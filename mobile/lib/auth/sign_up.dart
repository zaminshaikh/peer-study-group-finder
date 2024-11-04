// lib/auth/signup_page.dart
import 'package:flutter/material.dart';
import '../components/custom_text_field.dart';


class SignUpPage extends StatefulWidget {
  const SignUpPage({Key? key}) : super(key: key);
  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  final nameController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  void handleSignUp() {
    // Implement sign-up logic
  }

  @override
  Widget build(BuildContext context) {
    final headlineStyle = Theme.of(context).textTheme.displayLarge;

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
              ElevatedButton(
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