// lib/dashboard/components/edit_group_sheet.dart

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:mobile/models/user_model.dart';
import 'package:mobile/models/study_group_model.dart';

class EditGroupSheet extends StatefulWidget {
  final StudyGroup group;

  const EditGroupSheet({Key? key, required this.group}) : super(key: key);

  @override
  _EditGroupSheetState createState() => _EditGroupSheetState();
}

class _EditGroupSheetState extends State<EditGroupSheet> {
  final _formKey = GlobalKey<FormState>();
  final nameController = TextEditingController();
  final descriptionController = TextEditingController();
  final locationController = TextEditingController();
  final meetingTimeController = TextEditingController();

  bool isSubmitting = false;

  String? selectedClass;
  List<String> classesList = [];

  int groupSize = 2;
  String selectedModality = 'Hybrid';

  final List<String> modalities = ['Hybrid', 'In Person', 'Online'];

  List<bool> selectedDays = List.filled(7, false);
  final List<String> weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  User? user;

  static var mapCodeToIndex = {
    "ACG": 0, "AMH": 1, "AML": 2, "BCH": 3, "BME": 4, "BSC": 5,
    "CAP": 6, "CDA": 7, "CEN": 8, "COT": 9, "COP": 10, "PHY": 11,
    "PSY": 12
  };

  @override
  void initState() {
    super.initState();
    loadClasses();

    nameController.text = widget.group.name;
    descriptionController.text = widget.group.description;
    locationController.text = widget.group.location ?? '';
    meetingTimeController.text = widget.group.meetingTime ?? '';
    selectedClass = widget.group.className;
    groupSize = widget.group.size;
    selectedModality = widget.group.modality;

    parseMeetingTime();

    loadUser();
  }

  void parseMeetingTime() {
    String? meetingTime = widget.group.meetingTime;
    if (meetingTime != null && meetingTime.isNotEmpty) {
      List<String> parts = meetingTime.trim().split(' ');
      List<String> days = [];
      String time = '';
      for (var part in parts) {
        if (weekdays.contains(part)) {
          days.add(part);
        } else {
          time = part;
        }
      }
      for (int i = 0; i < weekdays.length; i++) {
        if (days.contains(weekdays[i])) {
          selectedDays[i] = true;
        }
      }
      meetingTimeController.text = time;
    }
  }

  Future<void> loadClasses() async {
    final jsonString = await rootBundle.loadString('assets/classes.json');
    final data = jsonDecode(jsonString);

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

  Future<String> convertToClassCode(String codeAndName) async {
    final jsonString = await rootBundle.loadString('assets/classes.json');
    final data = jsonDecode(jsonString);
    return codeAndName.substring(0,3) + codeAndName.substring(4, codeAndName.indexOf('-') - 1);
  }

  Future<String> convertToClassCodeAndName(String code) async {
    final jsonString = await rootBundle.loadString('assets/classes.json');
    final data = jsonDecode(jsonString);

    String departmentFromCode = code.substring(0, 3);
    String courseNumberFromCode = code.substring(3);

    for (var department in data['departments']) {
      if (department['code'] == departmentFromCode) {
        for (var course in department['courses']) {
          if (course['number'] == courseNumberFromCode) {
            return ('${department['code']} ${course['number']} - ${course['title']}');
          }
        }
      }
    }

    return "PSY7980";

    /*
    int? departmentIndex = mapCodeToIndex[departmentFromCode];
    data['departments'][departmentIndex];]
      for (var course in department['courses']) {
        if (department['code'] == code)
        return ('${department['code']} ${course['number']} - ${course['title']}');
      }
    */  

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
    descriptionController.dispose();
    locationController.dispose();
    meetingTimeController.dispose();
    super.dispose();
  }

  void updateGroup() async {
    if (!_formKey.currentState!.validate() || user == null) return;

    setState(() => isSubmitting = true);

    try {
      String days = '';
      for (int i = 0; i < selectedDays.length; i++) {
        if (selectedDays[i]) {
          days += weekdays[i] + ' ';
        }
      }

      final response = await http.post(
        Uri.parse('http://studyhive.me:5000/api/editgroup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'UserId': user!.userId,
          'GroupId': widget.group.id,
          'Class': selectedClass,
          'Name': nameController.text,
          'Owner': widget.group.owner,
          'Modality': selectedModality,
          'Description': descriptionController.text,
          'Size': groupSize,
          'Location': locationController.text,
          'MeetingTime': days + meetingTimeController.text,
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
      setState(() => isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Edit Group',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  IconButton(
                    icon: Icon(Icons.close),
                    onPressed: () {
                      Navigator.pop(context);
                    },
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Group Name'),
                validator: (value) =>
                    value!.isEmpty ? 'Group name is required' : null,
              ),
              const SizedBox(height: 16),
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
              TextFormField(
                controller: descriptionController,
                decoration: const InputDecoration(labelText: 'Description'),
                validator: (value) =>
                    value!.isEmpty ? 'Description is required' : null,
                maxLines: 3,
              ),
              const SizedBox(height: 16),
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
              TextFormField(
                controller: locationController,
                decoration: const InputDecoration(labelText: 'Location'),
              ),
              const SizedBox(height: 16),
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
                    onSelected: (bool selected) {
                      setState(() {
                        selectedDays[index] = selected;
                      });
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),
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
                      onPressed: updateGroup,
                      child: const Text('Save Changes'),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}