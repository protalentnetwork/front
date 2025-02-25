'use client'

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Clock, Users, MessageSquare, Ticket, AlertCircle } from 'lucide-react';
import { reportApi, StatusDistribution, TicketsByAgent, TicketsTrend, MessageVolume, MessageDistribution, ResponseTimeByAgent, LoginActivity, UserRole, NewUsersByMonth, DashboardSummary } from './services/report.api';


// Interfaces para los props de componentes
interface SummaryCardProps {
    title: string;
    value: string | number;
    trend: string;
    trendPositive?: boolean;
    icon: React.ReactNode;
}

interface TabProps {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
}

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
    fullWidth?: boolean;
    isLoading?: boolean;
    error?: string | null;
}

interface PieChartLabelProps {
    name: string;
    percent: number;
}

// Define un tipo genérico para los datos de gráficos
type ChartData = StatusDistribution[] | TicketsByAgent[] | TicketsTrend[] | 
                MessageVolume[] | MessageDistribution[] | ResponseTimeByAgent[] | 
                LoginActivity[] | UserRole[] | NewUsersByMonth[];

// Definición de colores para gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Pantalla principal de reportes
const ReportsDashboard = () => {
    // Estados para almacenar datos
    const [ticketStatusData, setTicketStatusData] = useState<StatusDistribution[] | null>(null);
    const [ticketAgentData, setTicketAgentData] = useState<TicketsByAgent[] | null>(null);
    const [ticketTrendData, setTicketTrendData] = useState<TicketsTrend[] | null>(null);
    const [messageVolumeData, setMessageVolumeData] = useState<MessageVolume[] | null>(null);
    const [messageDistributionData, setMessageDistributionData] = useState<MessageDistribution[] | null>(null);
    const [responseTimeData, setResponseTimeData] = useState<ResponseTimeByAgent[] | null>(null);
    const [loginActivityData, setLoginActivityData] = useState<LoginActivity[] | null>(null);
    const [userRolesData, setUserRolesData] = useState<UserRole[] | null>(null);
    const [newUsersData, setNewUsersData] = useState<NewUsersByMonth[] | null>(null);
    const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null);

    // Estados para manejo de errores y carga
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tickets');

    // Función para cargar datos de una manera segura
    const fetchDataSafely = async <T extends ChartData | DashboardSummary>(
        fetchFunction: () => Promise<T>, 
        key: string, 
        setter: React.Dispatch<React.SetStateAction<T | null>>
    ) => {
        try {
            const data = await fetchFunction();

            // Verificar si los datos son válidos (no undefined/null y es un array o objeto)
            if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
                setter(data);
                setErrors(prev => ({ ...prev, [key]: null }));
            } else {
                console.warn(`No data received for ${key}`);
                setErrors(prev => ({ ...prev, [key]: `No se recibieron datos para ${key}` }));
            }
        } catch (error) {
            console.error(`Error fetching ${key}:`, error);
            setErrors(prev => ({ ...prev, [key]: `Error al cargar ${key}` }));
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);

            try {
                // Intentar cargar el resumen primero (crítico)
                await fetchDataSafely(
                    () => reportApi.getDashboardSummary(),
                    'summary',
                    setSummaryData
                );

                // Cargar el resto de los datos en paralelo
                await Promise.all([
                    fetchDataSafely(
                        () => reportApi.getTicketsByStatus(),
                        'statusDistribution',
                        setTicketStatusData
                    ),
                    fetchDataSafely(
                        () => reportApi.getTicketsByAgent(),
                        'ticketsByAgent',
                        setTicketAgentData
                    ),
                    fetchDataSafely(
                        () => reportApi.getTicketsTrend(),
                        'ticketsTrend',
                        setTicketTrendData
                    ),
                    fetchDataSafely(
                        () => reportApi.getMessageVolume(),
                        'messageVolume',
                        setMessageVolumeData
                    ),
                    fetchDataSafely(
                        () => reportApi.getMessageDistribution(),
                        'messageDistribution',
                        setMessageDistributionData
                    ),
                    fetchDataSafely(
                        () => reportApi.getResponseTimeByAgent(),
                        'responseTime',
                        setResponseTimeData
                    ),
                    fetchDataSafely(
                        () => reportApi.getLoginActivity(),
                        'loginActivity',
                        setLoginActivityData
                    ),
                    fetchDataSafely(
                        () => reportApi.getUserRoles(),
                        'userRoles',
                        setUserRolesData
                    ),
                    fetchDataSafely(
                        () => reportApi.getNewUsersByMonth(),
                        'newUsers',
                        setNewUsersData
                    ),
                ]);
            } catch (error) {
                console.error("Error general al cargar datos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Función para renderizar un gráfico de manera segura
    const renderSafeChart = <T extends ChartData>(
        data: T | null,
        errorKey: string,
        renderFunction: (validData: T) => React.ReactNode,
        emptyMessage: string = "No hay datos disponibles"
    ) => {
        if (errors[errorKey]) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-red-500">
                    <AlertCircle className="h-10 w-10 mb-2" />
                    <p>{errors[errorKey]}</p>
                </div>
            );
        }

        if (!data || (Array.isArray(data) && data.length === 0)) {
            return (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    {emptyMessage}
                </div>
            );
        }

        return renderFunction(data);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Cargando datos...</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6"></h1>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <SummaryCard
                    title="Total de Tickets"
                    value={summaryData?.totalTickets?.value || 0}
                    trend={summaryData?.totalTickets?.trend || "0%"}
                    icon={<Ticket className="h-8 w-8 text-blue-500" />}
                />
                <SummaryCard
                    title="Chats Activos"
                    value={summaryData?.activeChats?.value || 0}
                    trend={summaryData?.activeChats?.trend || "0%"}
                    icon={<MessageSquare className="h-8 w-8 text-green-500" />}
                />
                <SummaryCard
                    title="Usuarios Totales"
                    value={summaryData?.totalUsers?.value || 0}
                    trend={summaryData?.totalUsers?.trend || "0%"}
                    icon={<Users className="h-8 w-8 text-purple-500" />}
                />
                <SummaryCard
                    title="Tiempo Promedio Respuesta"
                    value={summaryData?.avgResponseTime?.value || "0 min"}
                    trend={summaryData?.avgResponseTime?.trend || "0%"}
                    trendPositive={summaryData?.avgResponseTime?.trendPositive || false}
                    icon={<Clock className="h-8 w-8 text-orange-500" />}
                />
            </div>

            {/* Tabs para navegación */}
            <div className="flex border-b mb-6">
                <Tab active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')}>Tickets</Tab>
                <Tab active={activeTab === 'chats'} onClick={() => setActiveTab('chats')}>Chats</Tab>
                <Tab active={activeTab === 'users'} onClick={() => setActiveTab('users')}>Usuarios</Tab>
            </div>

            {/* Contenido de los tabs */}
            {activeTab === 'tickets' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard
                        title="Estado de Tickets"
                        isLoading={!ticketStatusData}
                        error={errors.statusDistribution}
                    >
                        {renderSafeChart(
                            ticketStatusData,
                            'statusDistribution',
                            (data) => (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }: PieChartLabelProps) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {data.map((entry: StatusDistribution, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            )
                        )}
                    </ChartCard>

                    <ChartCard
                        title="Tickets por Agente"
                        isLoading={!ticketAgentData}
                        error={errors.ticketsByAgent}
                    >
                        {renderSafeChart(
                            ticketAgentData,
                            'ticketsByAgent',
                            (data) => (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={data}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="tickets" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )
                        )}
                    </ChartCard>

                    <ChartCard
                        title="Tendencia de Tickets"
                        fullWidth
                        isLoading={!ticketTrendData}
                        error={errors.ticketsTrend}
                    >
                        {renderSafeChart(
                            ticketTrendData,
                            'ticketsTrend',
                            (data) => (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart
                                        data={data}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="mes" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="cantidad"
                                            stroke="#8884d8"
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )
                        )}
                    </ChartCard>
                </div>
            )}

            {activeTab === 'chats' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard
                        title="Volumen de Mensajes (Hoy)"
                        isLoading={!messageVolumeData}
                        error={errors.messageVolume}
                    >
                        {renderSafeChart(
                            messageVolumeData,
                            'messageVolume',
                            (data) => (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={data}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hora" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="mensajes" fill="#00C49F" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )
                        )}
                    </ChartCard>

                    <ChartCard
                        title="Distribución de Mensajes"
                        isLoading={!messageDistributionData}
                        error={errors.messageDistribution}
                    >
                        {renderSafeChart(
                            messageDistributionData,
                            'messageDistribution',
                            (data) => (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }: PieChartLabelProps) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {data.map((entry: MessageDistribution, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            )
                        )}
                    </ChartCard>

                    <ChartCard
                        title="Tiempo de Respuesta por Agente"
                        fullWidth
                        isLoading={!responseTimeData}
                        error={errors.responseTime}
                    >
                        {renderSafeChart(
                            responseTimeData,
                            'responseTime',
                            (data) => (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={data}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis label={{ value: 'Minutos', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip />
                                        <Bar dataKey="tiempo" fill="#FF8042" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )
                        )}
                    </ChartCard>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard
                        title="Actividad de Login (Semana actual)"
                        isLoading={!loginActivityData}
                        error={errors.loginActivity}
                    >
                        {renderSafeChart(
                            loginActivityData,
                            'loginActivity',
                            (data) => (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart
                                        data={data}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="dia" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="logins" stroke="#8884d8" activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )
                        )}
                    </ChartCard>

                    <ChartCard
                        title="Roles de Usuario"
                        isLoading={!userRolesData}
                        error={errors.userRoles}
                    >
                        {renderSafeChart(
                            userRolesData,
                            'userRoles',
                            (data) => (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }: PieChartLabelProps) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {data.map((entry: UserRole, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            )
                        )}
                    </ChartCard>

                    <ChartCard
                        title="Nuevos Usuarios por Mes"
                        fullWidth
                        isLoading={!newUsersData}
                        error={errors.newUsers}
                    >
                        {renderSafeChart(
                            newUsersData,
                            'newUsers',
                            (data) => (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={data}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="mes" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="cantidad" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )
                        )}
                    </ChartCard>
                </div>
            )}
        </div>
    );
};

// Componentes auxiliares
const SummaryCard = ({ title, value, trend, trendPositive = true, icon }: SummaryCardProps) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            {icon}
        </div>
        <div className="flex items-baseline">
            <div className="text-2xl font-semibold">{value}</div>
            <div className={`ml-2 text-sm ${trendPositive ? 'text-green-500' : 'text-red-500'}`}>
                {trend}
            </div>
        </div>
    </div>
);

const Tab = ({ children, active, onClick }: TabProps) => (
    <button
        className={`px-6 py-2 font-medium text-sm ${active ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
            }`}
        onClick={onClick}
    >
        {children}
    </button>
);

const ChartCard = ({ title, children, fullWidth = false, isLoading = false, error = null }: ChartCardProps) => (
    <div className={`bg-white p-6 rounded-lg shadow ${fullWidth ? 'col-span-full' : ''}`}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{title}</h3>
            {isLoading && <div className="text-sm text-gray-500">Cargando...</div>}
            {error && (
                <div className="flex items-center text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Error al cargar datos
                </div>
            )}
        </div>
        {children}
    </div>
);

export default ReportsDashboard;