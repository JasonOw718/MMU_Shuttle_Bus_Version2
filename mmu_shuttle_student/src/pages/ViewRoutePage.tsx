import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { fetchActiveBusesLocation, fetchRouteById, subscribeToRoute } from "../services/routeService";
import BackButton from "../components/BackButton";
import RouteTitleTag from "../components/RouteTitleTag";
import StationAccordian from "../components/StationAccordian";
import GoogleMap from "../components/GoogleMap";
import LiveTrackingBadge from "../components/LiveTrackingBadge";
import DraggableBottomSheet from "../components/DraggableBottomSheet";
import MarqueeBanner from "../components/MarqueeBanner";
import { useEffect, useState } from "react";
import SnackBar from "../components/SnackBar";
import type { ActiveBus } from "../interfaces/models/ActiveBus";
import { Bus, ArrowRight } from 'lucide-react';
import { INDICATOR_COLOR } from "../shared/constants";
import { mapActiveBusResponseToActiveBusModel } from "../shared/mappers";

const ViewRoutePage = () => {
    const { id } = useParams();
    const routeId = Number(id);
    const navigate = useNavigate();

    const queryClient = useQueryClient();
    const [socketError, setSocketError] = useState<string | null>(null);

    const { data: route, isLoading: isRouteLoading, isError: isRouteError, error: routeError } = useQuery({
        queryKey: ['route', id],
        queryFn: async () => {
            return await fetchRouteById(routeId);
        },
        retry: (failureCount, error) => {
            if (error.message === "Route not found") {
                return false;
            }
            return failureCount < 3;
        }
    })


    const { data: activeBusses, isLoading: isActiveBussesLoading, isError: isActiveBussesError } = useQuery({
        queryKey: ['activeBuses', routeId],
        queryFn: async () => {
            return await fetchActiveBusesLocation(routeId);
        },
    })


    useEffect(() => {
        if (!routeId) return;

        const onUpdate = (message: any) => {
            try {
                const parsedData = JSON.parse(message.body);
                const incomingBus = mapActiveBusResponseToActiveBusModel(parsedData);

                queryClient.setQueryData(['activeBuses', routeId], (oldData: ActiveBus[] = []) => {
                    if (!incomingBus.active) {
                        return oldData.filter(bus => bus?.busPlate !== incomingBus?.busPlate);
                    }

                    const busExists = oldData.some(bus => bus?.busPlate === incomingBus?.busPlate);

                    if (busExists) {
                        return oldData.map(bus =>
                            bus.busPlate === incomingBus?.busPlate ? incomingBus : bus
                        );
                    } else {
                        return [...oldData, incomingBus];
                    }
                }
                );
            } catch (e) {
                setSocketError("Data Sync Error: Received incompatible data format.");
            }
        }

        const onError = (errorMessage: string) => {
            setSocketError(errorMessage);
        }

        const onConnect = () => {
            setSocketError(null);
        }

        const unsubscribe = subscribeToRoute(routeId, onUpdate, onConnect, onError);

        return unsubscribe;
    }, [routeId, queryClient]);

    const handleBackClick = () => {
        queryClient.invalidateQueries({ queryKey: ['activeBuses', routeId] });
        navigate('/');
    }

    const routeLine = route?.routeLine || [];
    const stations = route?.stations || [];
    const isLiveTracking: boolean = activeBusses ? activeBusses.length > 0 : false;
    const routeErrorMessage = routeError?.message;

    return (
        <div className="flex flex-col w-full h-screen">
            <MarqueeBanner className="py-1.5 bg-[#fef0cb] border-b border-amber-200 text-xs md:text-sm text-amber-700 shrink-0">
                <Bus size={14} className="shrink-0" />
                <ArrowRight size={10} className="shrink-0 text-amber-400" />
                <span>Bus icon beside a station means it has <strong>arrived</strong> at that station</span>
                <span className="mx-2 text-amber-300">•</span>
                <span>Blinking bus icon means it is <strong>in transit</strong> to the next station</span>
            </MarqueeBanner>

            <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-5 flex items-center gap-4 md:gap-6 z-10 shadow-sm relative shrink-0">
                <BackButton text="Back to Routes" onClick={handleBackClick} />
                <RouteTitleTag title={route?.routeName} indicatorColor={INDICATOR_COLOR} isLoading={isRouteLoading} isError={isRouteError} errorMessage={routeErrorMessage} />
            </div>

            <div className="flex-1 w-full bg-slate-50 relative flex flex-col md:flex-row overflow-hidden">
                <div className="w-full h-full md:flex-1 relative">
                    <GoogleMap routeLine={routeLine} stations={stations} activeBuses={activeBusses} />
                    <LiveTrackingBadge
                        isLiveTracking={isLiveTracking}
                        isLoading={isActiveBussesLoading}
                        isError={isActiveBussesError || isRouteError}
                        errorMessage={routeErrorMessage}
                    />
                </div>

                <DraggableBottomSheet>
                    <StationAccordian stations={stations} activeBuses={activeBusses} isLoading={isRouteLoading} isError={isRouteError} errorMessage={routeErrorMessage} />
                </DraggableBottomSheet>

                <div className="hidden md:block md:flex-none md:w-[400px] lg:w-[480px] bg-white md:border-l border-gray-200 z-10 md:shrink-0 shadow-[-4px_0_24px_rgb(0,0,0,0.02)] overflow-y-auto">
                    <StationAccordian stations={stations} activeBuses={activeBusses} isLoading={isRouteLoading} isError={isRouteError} errorMessage={routeErrorMessage} />
                </div>
            </div>

            <SnackBar isOpen={socketError !== null} message={socketError ?? ''} onClose={() => setSocketError(null)} />
        </div>
    );
}

export default ViewRoutePage;