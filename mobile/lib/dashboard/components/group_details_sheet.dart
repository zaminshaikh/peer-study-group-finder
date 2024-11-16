// lib/dashboard/components/group_details_sheet.dart

import 'package:flutter/material.dart';
import 'package:mobile/dashboard/components/edit_group_sheet.dart';
import 'package:mobile/models/study_group_model.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/models/user_model.dart';
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
  User? user;

  @override
  void initState() {
    super.initState();
    loadUser();
  }

  Future<void> loadUser() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? userJson = prefs.getString('user');
    if (userJson != null) {
      try {
        Map<String, dynamic> userMap = jsonDecode(userJson);
        setState(() {
          user = User.fromJson(userMap);
        });
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading user data: $e')),
        );
        Navigator.pushReplacementNamed(context, '/');
      }
    } else {
      Navigator.pushReplacementNamed(context, '/');
    }
  }

  bool isUserOwner() {
    return user != null && user!.userId == widget.group.owner;
  }

  bool isUserJoined() {
    return user != null && user!.group.contains(widget.group.id);
  }

  void joinGroup() async {
    if (user == null) return;

    setState(() => isLoading = true);

    try {
      final response = await http.post(
        Uri.parse('http://your_server_address/api/joingroup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'UserId': user!.userId, 'GroupId': widget.group.id}),
      );

      if (response.statusCode == 200) {
        user!.group.add(widget.group.id);
        SharedPreferences prefs = await SharedPreferences.getInstance();
        prefs.setString('user', jsonEncode(user!.toJson()));

        Navigator.pop(context, 'joined');
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

  void leaveGroup() async {
    if (user == null) return;

    setState(() => isLoading = true);

    try {
      final response = await http.post(
        Uri.parse('http://your_server_address/api/leavegroup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'UserId': user!.userId, 'GroupId': widget.group.id}),
      );

      if (response.statusCode == 200) {
        user!.group.remove(widget.group.id);
        SharedPreferences prefs = await SharedPreferences.getInstance();
        prefs.setString('user', jsonEncode(user!.toJson()));

        Navigator.pop(context, 'left');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Left group successfully')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to leave group')),
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

  void editGroup() async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => EditGroupSheet(group: widget.group),
    );
    Navigator.pop(context, 'edited');
  }

  @override
  Widget build(BuildContext context) {
    final group = widget.group;
    final screenHeight = MediaQuery.of(context).size.height;

    return SizedBox(
      height: screenHeight * 0.6,
      width: double.infinity,
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
                  const SizedBox(height: 16),
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
                  if (group.description.isNotEmpty)
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
                  // [Add other group details as needed]

                  const Spacer(),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: isUserOwner()
                          ? editGroup
                          : isUserJoined()
                              ? leaveGroup
                              : joinGroup,
                      child: Text(
                        isUserOwner()
                            ? 'Edit Group'
                            : isUserJoined()
                                ? 'Leave Group'
                                : 'Join Group',
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}