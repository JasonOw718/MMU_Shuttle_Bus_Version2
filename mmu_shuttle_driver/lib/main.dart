import 'package:flutter/material.dart';
import 'package:mmu_shuttle_driver/core/routing/app_router.dart';
import 'package:mmu_shuttle_driver/features/announcement/providers/announcement_provider.dart';
import 'package:mmu_shuttle_driver/features/announcement/providers/file_provider.dart';
import 'package:mmu_shuttle_driver/features/authentication/providers/auth_provider.dart';
import 'package:mmu_shuttle_driver/features/routes/providers/route_provider.dart';
import 'package:mmu_shuttle_driver/features/vehicle/providers/vehicle_provider.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:toastification/toastification.dart';

void main() async {
  await dotenv.load(fileName: ".env");
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => RouteProvider()),
        ChangeNotifierProvider(create: (_) => AnnouncementProvider()),
        ChangeNotifierProvider(create: (_) => VehicleProvider()),
        ChangeNotifierProvider(create: (_) => FileProvider()),
      ],
      child: ToastificationWrapper(
        child: MaterialApp.router(
          title: 'MMU Shuttle Bus (Driver)',
          theme: ThemeData(
            colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
          ),
          routerConfig: appRouter,
          debugShowCheckedModeBanner: false,
        ),
      ),
    );
  }
}
