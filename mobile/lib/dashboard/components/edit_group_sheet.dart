// lib/dashboard/components/edit_group_modal.dart

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/models/study_group_model.dart';
import 'package:mobile/models/user_model.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class EditGroupSheet extends StatefulWidget {
  final StudyGroup group;

  const EditGroupSheet({Key? key, required this.group}) : super(key: key);

  @override
  _EditGroupSheetState createState() => _EditGroupSheetState();
}

class _EditGroupSheetState extends State<EditGroupSheet> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController nameController;
  late TextEditingController classController;
  late TextEditingController descriptionController;
  late TextEditingController sizeController;
  String modality = 'In Person';
  late TextEditingController locationController;
  late TextEditingController meetingTimeController;

  bool isLoading = false;

  final List<String> modalities = ['In Person', 'Online', 'Hybrid'];

  User? user;

  @override
  void initState() {
    super.initState();
    nameController = TextEditingController(text: widget.group.name);
    classController = TextEditingController(text: widget.group.className);
    descriptionController = TextEditingController(text: widget.group.description);
    sizeController = TextEditingController(text: widget.group.size.toString());
    modality = widget.group.modality;
    locationController = TextEditingController(text: widget.group.location ?? '');
    meetingTimeController = TextEditingController(text: widget.group.meetingTime ?? '');
    loadUser();
  }

  Future<void> loadUser() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? userJson = prefs.getString('user');
    if (userJson != null) {
      Map<String, dynamic> userMap = jsonDecode(userJson);
      setState(() {
        user = User.fromJson(userMap);
      });
    } else {
      Navigator.pop(context);
    }
  }

  @override
  void dispose() {
    nameController.dispose();
    classController.dispose();
    descriptionController.dispose();
    sizeController.dispose();
    locationController.dispose();
    meetingTimeController.dispose();
    super.dispose();
  }

  void updateGroup() async {
    if (!_formKey.currentState!.validate() || user == null) return;

    setState(() => isLoading = true);

    try {
      final response = await http.post(
        Uri.parse('http://your_server_address/api/editgroup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'UserId': user!.userId,
          'GroupId': widget.group.id,
          'Class': classController.text,
          'Name': nameController.text,
          'Owner': widget.group.owner,
          'Modality': modality,
          'Description': descriptionController.text,
          'Size': int.parse(sizeController.text),
          'Location': locationController.text,
          'MeetingTime': meetingTimeController.text,
          // Include other fields if necessary
        }),
      );

      if (response.statusCode == 200) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Group updated successfully')),
        );
      } else {
        final data = jsonDecode(response.body);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update group: ${data['error']}')),
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
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 16,
        right: 16,
        top: 16,
      ),
      child: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'Edit Group',
                      style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: nameController,
                      decoration: const InputDecoration(labelText: 'Group Name'),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter a group name';
                        }
                        return null;
                      },
                    ),
                    TextFormField(
                      controller: classController,
                      decoration: const InputDecoration(labelText: 'Class'),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter a class';
                        }
                        return null;
                      },
                    ),
                    TextFormField(
                      controller: descriptionController,
                      decoration: const InputDecoration(labelText: 'Description'),
                      maxLines: 3,
                    ),
                    TextFormField(
                      controller: sizeController,
                      decoration: const InputDecoration(labelText: 'Group Size'),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter group size';
                        }
                        if (int.tryParse(value) == null) {
                          return 'Please enter a valid number';
                        }
                        return null;
                      },
                    ),
                    DropdownButtonFormField<String>(
                      value: modality,
                      items: modalities.map((String value) {
                        return DropdownMenuItem<String>(
                          value: value,
                          child: Text(value),
                        );
                      }).toList(),
                      decoration: const InputDecoration(labelText: 'Modality'),
                      onChanged: (val) {
                        setState(() {
                          modality = val!;
                        });
                      },
                    ),
                    TextFormField(
                      controller: locationController,
                      decoration: const InputDecoration(labelText: 'Location'),
                    ),
                    TextFormField(
                      controller: meetingTimeController,
                      decoration: const InputDecoration(labelText: 'Meeting Time'),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: updateGroup,
                        child: const Text('Save Changes'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}