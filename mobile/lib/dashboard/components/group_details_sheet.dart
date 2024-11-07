// lib/widgets/group_details_sheet.dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

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
        Uri.parse('http://10.0.2.2:8000/api/getgroupdetails?name=${widget.groupId}'),
        headers: {'Content-Type': 'application/json'},
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
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? userId = prefs.getString('userId');
    if (userId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('User not logged in')),
      );
      Navigator.pop(context);
      return;
    }

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
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to join group')),
        );
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
      padding: EdgeInsets.only(
        bottom: 16,
        top: 16,
        left: 16,
        right: 16,
      ),
      child: isLoading
          ? const Center(child: CircularProgressIndicator())
          : group == null
              ? Center(child: Text(error))
              : SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.groupId,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text('Class: ${group!['Class']}'),
                      const SizedBox(height: 8),
                      Text('Description: ${group!['Description']}'),
                      const SizedBox(height: 8),
                      Text('Size: ${group!['Size']}'),
                      const SizedBox(height: 8),
                      Text('Modality: ${group!['Modality']}'),
                      if (group!['Location'] != null) ...[
                        const SizedBox(height: 8),
                        Text('Location: ${group!['Location']}'),
                      ],
                      if (group!['MeetingTime'] != null) ...[
                        const SizedBox(height: 8),
                        Text('Meeting Time: ${group!['MeetingTime']}'),
                      ],
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