// lib/widgets/group_details_sheet.dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class GroupDetailsSheet extends StatefulWidget {
  final String groupId;

  const GroupDetailsSheet({Key? key, required this.groupId}) : super(key: key);

  @override
  _GroupDetailsSheetState createState() => _GroupDetailsSheetState();
}

class _GroupDetailsSheetState extends State<GroupDetailsSheet> {
  Map<String, dynamic>? group;
  bool isLoading = true;
  String error = '';

  @override
  void initState() {
    super.initState();
    fetchGroupDetails();
  }

  Future<void> fetchGroupDetails() async {
    try {
      final response = await http.get(
        Uri.parse('http://10.0.2.2:8000/api/getgroupdetails?groupId=${widget.groupId}'),
      );

      if (response.statusCode == 200) {
        setState(() {
          group = jsonDecode(response.body);
          isLoading = false;
        });
      } else {
        setState(() {
          error = 'Failed to load group details';
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        error = 'An error occurred: $e';
        isLoading = false;
      });
    }
  }

  void joinGroup() async {
    // TODO: Replace 'your-user-id' with the actual user ID
    const String userId = 'your-user-id';

    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:8000/api/joingroup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'UserId': userId, 'GroupId': widget.groupId}),
      );

      if (response.statusCode == 200) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Joined group successfully')),
        );
      } else {
        throw Exception('Failed to join group');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('An error occurred: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding:
          EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: isLoading
          ? const Center(child: CircularProgressIndicator())
          : group == null
              ? Center(child: Text(error))
              : Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Wrap(
                    children: [
                      Text(
                        group!['Name'],
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text('Class: ${group!['Class']}'),
                      const SizedBox(height: 8),
                      Text('Description: ${group!['Description']}'),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: joinGroup,
                        child: const Text('Join Group'),
                      ),
                    ],
                  ),
                ),
    );
  }
}