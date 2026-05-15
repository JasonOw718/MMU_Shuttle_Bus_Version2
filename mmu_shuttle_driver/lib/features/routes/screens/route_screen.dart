import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mmu_shuttle_driver/core/widgets/error_label.dart';
import 'package:mmu_shuttle_driver/core/widgets/header.dart';
import 'package:mmu_shuttle_driver/features/routes/models/route_model.dart';
import 'package:mmu_shuttle_driver/features/routes/providers/route_provider.dart';
import 'package:mmu_shuttle_driver/features/routes/widgets/route_card.dart';
import 'package:mmu_shuttle_driver/features/routes/widgets/skeleton.dart';
import 'package:provider/provider.dart';

class RouteScreen extends StatefulWidget {
  const RouteScreen({super.key});

  @override
  State<RouteScreen> createState() => _RouteScreenState();
}

class _RouteScreenState extends State<RouteScreen> {
  //methods
  void _onTap(BuildContext context, RouteModel route) {
    final routeProvider = context.read<RouteProvider>();
    routeProvider.selectRoute(route);
    context.push('/start-route');
  }

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<RouteProvider>().fetchRoutes();
      }
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(25, 18, 25, 0),
          child: HeaderWidget(
            title: 'My Routes',
            subtitle: 'Select a route to start pickup',
          ),
        ),
        const SizedBox(height: 25),
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => context.read<RouteProvider>().fetchRoutes(),
            child: Consumer<RouteProvider>(
              builder: (context, routeProvider, child) {
                //passed value
                final routes = routeProvider.routes;
                final isLoading = routeProvider.isLoading;
                final errorMessage = routeProvider.errorMesssage;

                return LayoutBuilder(
                  builder: (context, constraints) {
                    Widget body;

                    if (isLoading) {
                      body = Column(
                        children: List.generate(3, (index) {
                          return const Column(
                            children: [SkeletonWidget(), SizedBox(height: 10)],
                          );
                        }),
                      );
                    } else if (errorMessage != null) {
                      body = Center(
                        child: ErrorLabelWidget(
                          errorMessage: errorMessage,
                          onRetry: () {
                            routeProvider.fetchRoutes();
                          },
                        ),
                      );
                    } else if (routes.isEmpty) {
                      body = Center(
                        child: Text(
                          'No routes found',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey[600],
                          ),
                        ),
                      );
                    } else {
                      body = Column(
                        children: routes.map((route) {
                          return Column(
                            children: [
                              RouteCardWidget(
                                routeName: route.routeName,
                                stationCount: route.totalStations,
                                onTap: () => _onTap(context, route),
                              ),
                              const SizedBox(height: 10),
                            ],
                          );
                        }).toList(),
                      );
                    }

                    return SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 25),
                      child: ConstrainedBox(
                        constraints: BoxConstraints(
                          minHeight: constraints.maxHeight,
                        ),
                        child: body,
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}
