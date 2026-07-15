'use client';

import { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { Order } from '../types/order';
import { useOrderMutation } from '../hooks/useOrderMutation';

import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import KPIRow from '../components/KPIRow';
import OrderTable from '../components/OrderTable';
import OrderDrawer from '../components/OrderDrawer';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import NewOrderModal from '../components/NewOrderModal';
import EditOrderModal from '../components/EditOrderModal';

export default function Home() {
  const { orders, isLoading, error, status, setStatus, refetch } = useOrders();
  const { deleteOrder, updateOrder } = useOrderMutation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // Filter orders by search term
  const filteredOrders = orders.filter(
    (order) =>
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          currentStatus={status}
          onStatusChange={setStatus}
          onNewOrder={() => setIsNewOrderModalOpen(true)}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* KPI Row */}
          <KPIRow orders={orders} />

          {/* Error Banner */}
          {error && <ErrorBanner message={error} onRetry={refetch} />}

          {/* Table */}
          <div className="pb-8">
            {isLoading ? (
              <LoadingSkeleton />
            ) : filteredOrders.length === 0 ? (
              <EmptyState status={status} />
            ) : (
              <OrderTable 
                orders={filteredOrders} 
                onOrderClick={setSelectedOrder} 
                onDelete={async (order) => {
                  await deleteOrder(order.id);
                  refetch();
                }}
                onEdit={setEditingOrder}
              />
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Drawer */}
      <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusUpdated={refetch} />

      {/* New Order Modal */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        onSuccess={refetch}
      />

      {/* Edit Order Modal */}
      <EditOrderModal
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        order={editingOrder}
        onSuccess={refetch}
      />
    </div>
  );
}
