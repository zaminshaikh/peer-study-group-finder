import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({Key? key}) : super(key: key);

  @override
  _DashboardPageState createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  List<dynamic> groups = [];
  bool isLoading = true;
  String? userId; // Declare userId

  @override
  void initState() {
    super.initState();
    loadUserId(); // Load userId before fetching groups
  }

  Future<void> loadUserId() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      userId = prefs.getString('userId');
    });
    if (userId != null) {
      fetchGroups();
    } else {
      // Handle null userId, possibly navigate back to login
      Navigator.pushReplacementNamed(context, '/');
    }
  }

  Future<void> fetchGroups() async {
    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:8000/api/searchgroups'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'UserId': userId, 'Search': ''}),
      );

      if (response.statusCode == 200) {
        setState(() {
          groups = jsonDecode(response.body)['results'];
          isLoading = false;
        });
      } else {
        throw Exception('Failed to load groups');
      }
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('An error occurred: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Study Groups')),
      body: ListView.builder(
        itemCount: groups.length,
        itemBuilder: (context, index) {
          return ListTile(
            title: Text(groups[index]['Name']),
            subtitle: Text(groups[index]['Class']),
            onTap: () {
              // Navigate to group details
            },
          );
        },
      ),
    );
  }
}