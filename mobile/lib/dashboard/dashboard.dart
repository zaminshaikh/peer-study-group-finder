// lib/dashboard.dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/dashboard/components/create_group_sheet.dart';
import 'package:mobile/dashboard/components/filter_modal_sheet.dart';
import 'package:mobile/dashboard/components/group_card.dart';
import 'package:mobile/dashboard/components/group_details_sheet.dart';
import 'package:mobile/models/study_group_model.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  DashboardPageState createState() => DashboardPageState();
}

class DashboardPageState extends State<DashboardPage> {
  List<StudyGroup> groups = [];
  bool isLoading = true;
  int? userId;
  TextEditingController searchController = TextEditingController();
  List<StudyGroup> filteredGroups = [];
  Map<String, dynamic> selectedFilters = {};

  @override
  void initState() {
    super.initState();
    loadUserId();
  }

  Future<void> loadUserId() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    userId = prefs.getInt('userId');
    if (userId != null) {
      fetchGroups();
    } else {
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/');
    }
  }

  Future<void> fetchGroups() async {
    setState(() => isLoading = true);
  
    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:8000/api/fetchgroups'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({}), // Sending an empty body since no parameters are needed
      );
  
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
  
        // Parse the list of groups from the response
        List<StudyGroup> groupList = [];
  
        for (var groupData in data['results']) {
          groupList.add(StudyGroup(
            id: groupData['_id'], // Adjust according to your data structure
            name: groupData['Name'],
            description: groupData['Description'] ?? '',
            className: groupData['Class'] ?? '',
            size: groupData['Size'] ?? 0,
            modality: groupData['Modality'] ?? '',
            location: groupData['Location'],
            meetingTime: groupData['MeetingTime'],
          ));
        }
  
        setState(() {
          groups = groupList;
          filteredGroups = groupList; // Since all groups are fetched, no need to filter
          isLoading = false;
        });
      } else {
        throw Exception('Failed to load groups');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('An error occurred: $e')),
      );
    }
  }
  
  void _applyFilters() {
    setState(() {
      filteredGroups = groups.where((group) {
        final matchesModality = selectedFilters['modalities'] == null ||
            selectedFilters['modalities'].isEmpty ||
            selectedFilters['modalities'].contains(group.modality);
        final matchesSize = group.size <= (selectedFilters['maxSize'] ?? 200);

        return matchesModality && matchesSize;
      }).toList();
    });
  }

  void _showFilterModal() {
    showModalBottomSheet(
      context: context,
      builder: (_) => FilterModalSheet(
        onApplyFilters: (filters) {
          setState(() {
            selectedFilters = filters;
            _applyFilters();
          });
        },
      ),
    );
  }

  void _showCreateGroup() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => const CreateGroupSheet(),
    ).then((_) {
      fetchGroups();
    });
  }

  void _showGroupDetails(StudyGroup group) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => GroupDetailsSheet(group: group),
    );
  }

  @override
  void dispose() {
    searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Study Groups'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterModal,
          ),
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _showCreateGroup,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              controller: searchController,
              decoration: InputDecoration(
                hintText: 'Search Groups...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              onChanged: (value) {
                fetchGroups();
              },
            ),
          ),
          // Groups List
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : filteredGroups.isEmpty
                    ? const Center(child: Text('No groups found.'))
                    : ListView.builder(
                        itemCount: filteredGroups.length,
                        itemBuilder: (context, index) {
                          final group = filteredGroups[index];
                          return GroupCard(
                            group: group,
                            onTap: () {
                              _showGroupDetails(group);
                            },
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}