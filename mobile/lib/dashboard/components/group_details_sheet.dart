// lib/widgets/group_details_sheet.dart
import 'package:flutter/material.dart';
import 'package:mobile/models/study_group_model.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class GroupDetailsSheet extends StatefulWidget {
  final StudyGroup group;

  const GroupDetailsSheet({Key? key, required this.group}) : super(key: key);

  @override
  _GroupDetailsSheetState createState() => _GroupDetailsSheetState();
}

class _GroupDetailsSheetState extends State<GroupDetailsSheet> {
  bool isLoading = false;

  void joinGroup() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    int? userId = prefs.getInt('userId');
    if (userId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('User not logged in')),
      );
      Navigator.pop(context);
      return;
    }

    setState(() => isLoading = true);

    try {
      String groupId = widget.group.id.toString();
      final response = await http.post(
        Uri.parse('http://10.0.2.2:8000/api/joingroup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'UserId': userId, 'GroupName': widget.group.name}),
      );

      if (response.statusCode == 200) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Joined group successfully')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to join group')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('An error occurred: $e')),
      );
    } finally {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final group = widget.group;
    final screenHeight = MediaQuery.of(context).size.height;
  
    return SizedBox(
      height: screenHeight * 0.6, // Half the screen height
      width: double.infinity, // Full horizontal width
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    group.name,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 16), // Increased spacing
                  // Class
                  Row(
                    children: [
                      const Icon(Icons.class_),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Class: ${group.className}',
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Description
                  Row(
                    children: [
                      const Icon(Icons.description),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Description: ${group.description}',
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Size
                  Row(
                    children: [
                      const Icon(Icons.people),
                      const SizedBox(width: 8),
                      Text(
                        'Size: ${group.size}',
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Modality
                  Row(
                    children: [
                      const Icon(Icons.device_hub),
                      const SizedBox(width: 8),
                      Text(
                        'Modality: ${group.modality}',
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Location (if available)
                  if (group.location != null && group.location!.isNotEmpty) ...[
                    Row(
                      children: [
                        const Icon(Icons.location_on),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Location: ${group.location}',
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                  ],
                  // Meeting Time (if available)
                  if (group.meetingTime != null &&
                      group.meetingTime!.isNotEmpty) ...[
                    Row(
                      children: [
                        const Icon(Icons.schedule),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Meeting Time: ${group.meetingTime}',
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                  ],
                  const Spacer(), // Pushes the button to the bottom
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: joinGroup,
                      child: const Text('Join Group'),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}