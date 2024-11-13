// lib/widgets/create_group_sheet.dart

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/services.dart' show rootBundle;

class CreateGroupSheet extends StatefulWidget {
  const CreateGroupSheet({Key? key}) : super(key: key);

  @override
  _CreateGroupSheetState createState() => _CreateGroupSheetState();
}

class _CreateGroupSheetState extends State<CreateGroupSheet> {
  final _formKey = GlobalKey<FormState>();
  final nameController = TextEditingController();
  final descriptionController = TextEditingController();
  final locationController = TextEditingController();
  final meetingTimeController = TextEditingController();

  bool isSubmitting = false;

  // New variables for dropdowns and sliders
  String? selectedClass;
  List<String> classesList = []; // Filled from classes.json

  int groupSize = 2; // Default value
  String selectedModality = 'Hybrid'; // Default value

  // Options for Modality
  final List<String> modalities = ['Hybrid', 'In Person', 'Online'];

  // Variables for meeting days
  List<bool> selectedDays = List.filled(7, false);
  final List<String> weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  @override
  void initState() {
    super.initState();
    loadClasses();
  }

  /// Loads classes from classes.json
  Future<void> loadClasses() async {
    final jsonString = await rootBundle.loadString('assets/classes.json');
    final data = jsonDecode(jsonString);

    // Parse the data to extract class codes and titles
    List<String> classList = [];
    for (var department in data['departments']) {
      for (var course in department['courses']) {
        String classCode =
            '${department['code']} ${course['number']} - ${course['title']}';
        classList.add(classCode);
      }
    }
    setState(() {
      classesList = classList;
    });
  }

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

        // Format selected days
        String days = '';
        for (int i = 0; i < selectedDays.length; i++) {
          if (selectedDays[i]) {
            days += weekdays[i] + ' ';
          }
        }

        final response = await http.post(
          Uri.parse('http://10.0.2.2:8000/api/addgroup'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'Name': nameController.text,
            'Description': descriptionController.text,
            'Class': selectedClass,
            'Owner': userId,
            'Size': groupSize,
            'Modality': selectedModality,
            'Location': locationController.text,
            'MeetingTime': days + meetingTimeController.text,
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
    // Make the modal scrollable by wrapping content in SingleChildScrollView
    return SingleChildScrollView(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            // Use mainAxisSize to wrap content
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Create Group',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              // Group Name
              TextFormField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Group Name'),
                validator: (value) =>
                    value!.isEmpty ? 'Group name is required' : null,
              ),
              const SizedBox(height: 16),
              // Class Dropdown
              DropdownButtonFormField<String>(
                isExpanded: true,
                value: selectedClass,
                decoration: const InputDecoration(labelText: 'Class'),
                items: classesList.map((String classItem) {
                  return DropdownMenuItem<String>(
                    value: classItem,
                    child: Text(classItem),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    selectedClass = value;
                  });
                },
                validator: (value) =>
                    value == null || value.isEmpty ? 'Class is required' : null,
              ),
              const SizedBox(height: 16),
              // Description
              TextFormField(
                controller: descriptionController,
                decoration: const InputDecoration(labelText: 'Description'),
                validator: (value) =>
                    value!.isEmpty ? 'Description is required' : null,
                maxLines: 3,
              ),
              const SizedBox(height: 16),
              // Group Size Slider
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Group Size',
                    style: TextStyle(fontSize: 16),
                  ),
                  Slider(
                    value: groupSize.toDouble(),
                    min: 2,
                    max: 100,
                    divisions: 98,
                    label: groupSize.toString(),
                    onChanged: (double value) {
                      setState(() {
                        groupSize = value.toInt();
                      });
                    },
                  ),
                  Text('Selected Size: $groupSize'),
                ],
              ),
              const SizedBox(height: 16),
              // Modality Dropdown
              DropdownButtonFormField<String>(
                isExpanded: true,
                value: selectedModality,
                decoration: const InputDecoration(labelText: 'Modality'),
                items: modalities.map((String modality) {
                  return DropdownMenuItem<String>(
                    value: modality,
                    child: Text(modality),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    selectedModality = value!;
                  });
                },
                validator: (value) =>
                    value == null || value.isEmpty ? 'Modality is required' : null,
              ),
              const SizedBox(height: 16),
              // Location
              TextFormField(
                controller: locationController,
                decoration: const InputDecoration(labelText: 'Location'),
              ),
              const SizedBox(height: 16),
              // Meeting Days Selector
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Meeting Days',
                  style: TextStyle(fontSize: 16),
                ),
              ),
              Wrap(
                spacing: 8.0,
                children: List<Widget>.generate(7, (int index) {
                  return FilterChip(
                    label: Text(weekdays[index]),
                    selected: selectedDays[index],
                    onSelected: (bool value) {
                      setState(() {
                        selectedDays[index] = value;
                      });
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),
              // Meeting Time Picker
              TextFormField(
                controller: meetingTimeController,
                readOnly: true,
                decoration: const InputDecoration(
                  labelText: 'Meeting Time',
                  hintText: 'Select Meeting Time',
                ),
                onTap: () async {
                  final time = await showTimePicker(
                    context: context,
                    initialTime: TimeOfDay.now(),
                  );
                  if (time != null) {
                    setState(() {
                      meetingTimeController.text = time.format(context);
                    });
                  }
                },
                validator: (value) => value == null || value.isEmpty
                    ? 'Meeting time is required'
                    : null,
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
      ),
    );
  }
}