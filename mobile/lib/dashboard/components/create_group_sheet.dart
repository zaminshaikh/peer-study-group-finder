// lib/widgets/create_group_sheet.dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

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
  final sizeController = TextEditingController();
  final modalityController = TextEditingController();
  final locationController = TextEditingController();
  final meetingTimeController = TextEditingController();
  bool isSubmitting = false;

  void createGroup() async {
    if (_formKey.currentState!.validate()) {
      setState(() => isSubmitting = true);

      try {
        SharedPreferences prefs = await SharedPreferences.getInstance();
        String? userId = prefs.getString('userId');

        if (userId == null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('User not logged in')),
          );
          Navigator.pop(context);
          return;
        }

        final response = await http.post(
          Uri.parse('http://10.0.2.2:8000/api/addgroup'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'Name': nameController.text,
            'Description': descriptionController.text,
            'Class': classController.text,
            'Owner': userId,
            'Size': int.parse(sizeController.text),
            'Modality': modalityController.text,
            'Location': locationController.text,
            'MeetingTime': meetingTimeController.text,
          }),
        );

        if (response.statusCode == 200) {
          Navigator.pop(context, true);
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
                    decoration:
                        const InputDecoration(labelText: 'Group Name'),
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
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: sizeController,
                    decoration:
                        const InputDecoration(labelText: 'Group Size'),
                    keyboardType: TextInputType.number,
                    validator: (value) =>
                        value!.isEmpty ? 'Size is required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: modalityController,
                    decoration:
                        const InputDecoration(labelText: 'Modality'),
                    validator: (value) =>
                        value!.isEmpty ? 'Modality is required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: locationController,
                    decoration:
                        const InputDecoration(labelText: 'Location'),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: meetingTimeController,
                    decoration:
                        const InputDecoration(labelText: 'Meeting Time'),
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