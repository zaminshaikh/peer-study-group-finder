class StudyGroup {
  final String id;
  final String name;
  final String description;
  final String className;
  final int size;
  final String modality;
  final String? location;
  final String? meetingTime;
  final int owner;
  // final DateTime createdAt;

  StudyGroup({
    required this.id,
    required this.name,
    required this.description,
    required this.className,
    required this.size,
    required this.modality,
    required this.owner,
    this.location,
    this.meetingTime,
    // required this.createdAt,
  });

  factory StudyGroup.fromJson(Map<String, dynamic> json) {
    return StudyGroup(
      id: json['GroupId'],
      name: json['Name'],
      description: json['Description'],
      className: json['Class'],
      size: json['Size'],
      modality: json['Modality'],
      owner: json['Owner'],
      location: json['Location'],
      meetingTime: json['MeetingTime'],
      // createdAt: DateTime.parse(json['CreatedAt']),
    );
  }
}
