// lib/dashboard.dart

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/dashboard/components/create_group_sheet.dart';
import 'package:mobile/dashboard/components/filter_modal_sheet.dart';
import 'package:mobile/dashboard/components/group_card.dart';
import 'package:mobile/dashboard/components/group_details_sheet.dart';
import 'package:mobile/models/study_group_model.dart';
import 'package:mobile/models/user_model.dart'; // Import the User model
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
  User? user; // User object
  TextEditingController searchController = TextEditingController();
  List<StudyGroup> filteredGroups = [];
  Map<String, dynamic> selectedFilters = {};

  @override
  void initState() {
    super.initState();
    loadUser();
  }

  /// Loads the User object from SharedPreferences
  Future<void> loadUser() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? userJson = prefs.getString('user');
    if (userJson != null) {
      try {
        Map<String, dynamic> userMap = jsonDecode(userJson);
        setState(() {
          user = User.fromJson(userMap);
        });
        fetchGroups();
        // Optionally, refresh groups or reapply filters here
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

  /// Fetches the list of study groups from the server
  Future<void> fetchGroups() async {
    setState(() {
      isLoading = true;
    });

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
            id: groupData['GroupId'].toString(), // Ensure consistent ID format
            name: groupData['Name'],
            description: groupData['Description'] ?? '',
            className: groupData['Class'] ?? '',
            size: groupData['Size'] ?? 0,
            modality: groupData['Modality'] ?? '',
            location: groupData['Location'],
            meetingTime: groupData['MeetingTime'],
            owner: groupData['Owner'],
          ));
        }

        setState(() {
          groups = groupList;
          filteredGroups = groupList; // Initially, all groups are shown
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

  /// Applies the selected filters to the list of groups
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

  /// Shows the filter modal sheet
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

  /// Shows the create group modal sheet
  void _showCreateGroup() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => const CreateGroupSheet(),
    ).then((_) {
      fetchGroups(); // Refresh groups after creating a new one
    });
  }

  /// Shows the group details sheet
  void _showGroupDetails(StudyGroup group) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => GroupDetailsSheet(group: group),
    ).then((result) async {
      if (result == 'joined') {
        // Reload user data to reflect changes in group memberships
        await loadUser();
        // Refresh the UI to show updated join status
        setState(() {
          // Optionally, you can reapply filters or refresh groups
          _applyFilters();
        });
      }
    });
  }

  @override
  void dispose() {
    searchController.dispose();
    super.dispose();
  }

  /// Determines if the user has joined a particular group
  bool isUserJoined(String groupId) {
    if (user == null) return false;
    return user!.group.contains(groupId);
  }

  bool isUserOwner(int groupOwnerId) {
    if (user == null) return false;
    // Ensure both IDs are compared as strings or integers
    return user!.userId == groupOwnerId;
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
          // Optional: Display user's display name
          if (user != null)
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Welcome, ${user!.displayName}!',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ),
            ),
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
                // Implement search functionality if needed
                // For now, refetch groups or filter locally
                _applyFilters();
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
                          bool isJoined = isUserJoined(group.id);
                          bool isOwner = isUserOwner(group.owner);
                          return GroupCard(
                            group: group,
                            isJoined: isJoined, // Pass the join status
                            isOwner: isOwner, // Pass the owner status
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