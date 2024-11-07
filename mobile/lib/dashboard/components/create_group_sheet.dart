// lib/widgets/create_group_sheet.dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class CreateGroupSheet extends StatefulWidget {
  const CreateGroupSheet({Key? key}) : super(key: key);

  @override
  _CreateGroupSheetState createState() => _CreateGroupSheetState();
}

class _CreateGroupSheetState extends State<CreateGroupSheet> {
  final _formKey = GlobalKey<FormState>();
  final nameController = TextEditingController();
  final classController = TextEditingController();
  final descriptionController = TextEditingController();
  bool isSubmitting = false;

  void createGroup() async {
    if (_formKey.currentState!.validate()) {
      setState(() => isSubmitting = true);

      try {
        // TODO: Replace 'your-user-id' with the actual user ID
        const String userId = 'your-user-id';

        final response = await http.post(
          Uri.parse('http://10.0.2.2:8000/api/addgroup'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'Class': classController.text,
            'Name': nameController.text,
            'Owner': userId,
            'Description': descriptionController.text,
            // Add other fields as necessary
          }),
        );

        if (response.statusCode == 200) {
          Navigator.pop(context, true); // Return true to indicate success
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Group created successfully')),
          );
        } else {
          throw Exception('Failed to create group');
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('An error occurred: $e')),
        );
      } finally {
        setState(() => isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding:
          EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Wrap(
          children: [
            Text(
              'Create Group',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    controller: nameController,
                    decoration: const InputDecoration(labelText: 'Group Name'),
                    validator: (value) =>
                        value!.isEmpty ? 'Group name is required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: classController,
                    decoration: const InputDecoration(labelText: 'Class'),
                    validator: (value) =>
                        value!.isEmpty ? 'Class is required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: descriptionController,
                    decoration:
                        const InputDecoration(labelText: 'Description'),
                    validator: (value) =>
                        value!.isEmpty ? 'Description is required' : null,
                    maxLines: 3,
                  ),
                  const SizedBox(height: 24),
                  isSubmitting
                      ? const CircularProgressIndicator()
                      : ElevatedButton(
                          onPressed: createGroup,
                          child: const Text('Create'),
                        ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}