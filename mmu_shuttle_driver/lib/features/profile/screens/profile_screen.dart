import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mmu_shuttle_driver/core/utils/toast.dart';
import 'package:mmu_shuttle_driver/core/widgets/error_label.dart';
import 'package:mmu_shuttle_driver/core/widgets/header.dart';
import 'package:mmu_shuttle_driver/features/announcement/providers/announcement_provider.dart';
import 'package:mmu_shuttle_driver/features/announcement/providers/file_provider.dart';
import 'package:mmu_shuttle_driver/features/authentication/providers/auth_provider.dart';
import 'package:mmu_shuttle_driver/features/profile/widgets/information_row.dart';
import 'package:mmu_shuttle_driver/features/profile/widgets/logout_button.dart';
import 'package:mmu_shuttle_driver/features/profile/widgets/profile_avatar.dart';
import 'package:mmu_shuttle_driver/features/routes/providers/route_provider.dart';
import 'package:provider/provider.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoading = false;

  void _handleSignOut(BuildContext context) async {
    try {
      setState(() {
        _isLoading = true;
      });
      await context.read<AuthProvider>().signOut();
      context.read<AuthProvider>().clearData();
      context.read<RouteProvider>().clearData();
      context.read<FileProvider>().clearData();
      context.read<AnnouncementProvider>().clearData();
      showSuccessToast(context, 'Sign out successfully');

      await Future.delayed(const Duration(milliseconds: 500));
      if (context.mounted) {
        context.go('/sign-in');
      }
    } catch (e) {
      showErrorToast(context, e.toString());
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<AuthProvider>().getDriverProfile();
      }
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final currentSignInDriver = authProvider.currentDriver;
        final isLoading = authProvider.isLoading;
        final errorMessage = authProvider.errorMessage;

        // passed value
        final id = currentSignInDriver?.id ?? -1;
        final email = currentSignInDriver?.email ?? '';

        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 25, vertical: 20),
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      HeaderWidget(
                        title: 'My Profile',
                        subtitle: 'Manage your profile',
                      ),
                      const SizedBox(height: 25),
                      if (isLoading)
                        const Center(child: CircularProgressIndicator())
                      else if (errorMessage != null)
                        Center(
                          child: ErrorLabelWidget(
                            errorMessage: errorMessage,
                            onRetry: () => authProvider.getDriverProfile(),
                          ),
                        )
                      else ...[
                        ProfileAvatarWidget(
                          name: 'MMU Driver',
                          driverId: id,
                        ),
                        const SizedBox(height: 8),
                        InformationRowWidget(label: 'Email', value: email),
                      ],
                    ],
                  ),
                ),
              ),
              LogoutButtonWidget(
                onPressed: _isLoading ? null : () => _handleSignOut(context),
                isLoading: _isLoading,
              ),
            ],
          ),
        );
      },
    );
  }
}
