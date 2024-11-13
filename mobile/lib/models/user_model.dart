// user_model.dart

class User {
  final int userId;
  final String firstName;
  final String lastName;
  final String displayName;
  final String email;
  final List<String> group;

  User({
    required this.userId,
    required this.firstName,
    required this.lastName,
    required this.displayName,
    required this.email,
    required this.group,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      userId: json['UserId'],
      firstName: json['FirstName'],
      lastName: json['LastName'],
      displayName: json['DisplayName'],
      email: json['Email'],
      group: List<String>.from(json['Group']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'UserId': userId,
      'FirstName': firstName,
      'LastName': lastName,
      'DisplayName': displayName,
      'Email': email,
      'Group': group,
    };
  }
}