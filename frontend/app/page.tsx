'use client';

import { useMemo, useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useLiveOrders } from '../hooks/useLiveOrders';
import { Order, OrderStatus } from '../types/order';
import { orderAPI } from '../services/api';
import { useOrderMutation } from '../hooks/useOrderMutation';
import { useOrderSelection } from '../hooks/useOrderSelection';
import BulkActionBar from '../components/BulkActionBar';
import FilterBar from '../components/filters/FilterBar';
import Toast from '../components/Toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
  const {
    orders,
    isLoading,
    error,
    status,
    setStatus,
    search,
    setSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    refetch,
  } = useOrders();
  const { deleteOrder } = useOrderMutation();
  const { selectedIds, selectedCount, hasSelection, toggleSelection, selectAll, clearSelection } = useOrderSelection();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);
  const [confirmBulkStatusOpen, setConfirmBulkStatusOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const activeFiltersCount = useMemo(() => {
    return [search, dateFrom, dateTo].filter(Boolean).length + (status !== 'All' ? 1 : 0);
  }, [search, dateFrom, dateTo, status]);

  const filteredOrders = orders;
  const availableStatuses: OrderStatus[] = ['Pending', 'Shipped', 'Delivered'];

  useLiveOrders({
    onOrderCreated: (order) => {
      setToastMessage(`New order ${order.id} received`);
      refetch();
    },
    onOrderUpdated: (order) => {
      setToastMessage(`Order ${order.id} updated`);
      refetch();
    },
    onOrderDeleted: (id) => {
      setToastMessage(`Order ${id} removed`);
      refetch();
    },
    onConnectionStateChange: setIsLiveConnected,
  });

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
          searchValue={search}
          onSearchChange={setSearch}
          activeFiltersCount={activeFiltersCount}
          onToggleFilters={() => setShowFilters((value) => !value)}
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* KPI Row */}
          <KPIRow orders={orders} />

          {/* Error Banner */}
          {error && <ErrorBanner message={error} onRetry={refetch} />}

          <div className="mx-8 mb-3 flex items-center justify-between rounded-md border border-border/60 bg-background/80 px-3 py-2 text-xs text-muted-foreground">
            <span>Live updates {isLiveConnected ? 'connected' : 'reconnecting'}</span>
            <span className={`h-2.5 w-2.5 rounded-full ${isLiveConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </div>

          {showFilters && (
            <div className="px-8 pt-4">
              <FilterBar
                searchValue={search}
                dateFrom={dateFrom}
                dateTo={dateTo}
                sortBy={sortBy}
                sortOrder={sortOrder}
                activeFiltersCount={activeFiltersCount}
                onClearFilters={() => {
                  setSearch('');
                  setDateFrom('');
                  setDateTo('');
                  setSortBy('date');
                  setSortOrder('desc');
                }}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                onSortByChange={setSortBy}
                onSortOrderChange={setSortOrder}
                currentStatus={status}
              />
            </div>
          )}

          {/* Table */}
          <div className="pb-8">
            {isLoading ? (
              <LoadingSkeleton />
            ) : filteredOrders.length === 0 ? (
              <EmptyState status={status} />
            ) : (
              <>
                {hasSelection && (
                  <BulkActionBar
                    selectedCount={selectedCount}
                    onClearSelection={clearSelection}
                    onBulkDelete={() => setConfirmBulkDeleteOpen(true)}
                    onBulkStatusUpdate={(newStatus) => {
                      setPendingStatus(newStatus);
                      setConfirmBulkStatusOpen(true);
                    }}
                    onExportCsv={() => {
                      const csvRows = [
                        ['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Placed'],
                        ...filteredOrders
                          .filter((order) => selectedIds.includes(order.id))
                          .map((order) => [
                            order.id,
                            order.customerName,
                            order.items.join('; '),
                            order.total.toFixed(2),
                            order.status,
                            order.createdAt || '',
                          ]),
                      ];

                      const csvContent = csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', 'selected-orders.csv');
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }}
                    availableStatuses={availableStatuses}
                  />
                )}

                <OrderTable
                  orders={filteredOrders}
                  selectedIds={selectedIds}
                  onOrderClick={setSelectedOrder}
                  onDelete={async (order) => {
                    await deleteOrder(order.id);
                    refetch();
                  }}
                  onEdit={setEditingOrder}
                  onToggleSelect={toggleSelection}
                  onSelectAll={selectAll}
                />
                <Dialog open={confirmBulkDeleteOpen} onOpenChange={(open) => !open && setConfirmBulkDeleteOpen(false)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete selected orders</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete {selectedCount} selected order{selectedCount === 1 ? '' : 's'}? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setConfirmBulkDeleteOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={async () => {
                          try {
                            await orderAPI.bulkDeleteOrders(selectedIds);
                            clearSelection();
                            refetch();
                            setToastMessage(`${selectedCount} order${selectedCount === 1 ? '' : 's'} deleted`);
                          } catch (error) {
                            console.error('Bulk delete failed', error);
                          } finally {
                            setConfirmBulkDeleteOpen(false);
                          }
                        }}
                      >
                        Delete {selectedCount} selected
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog open={confirmBulkStatusOpen} onOpenChange={(open) => !open && setConfirmBulkStatusOpen(false)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update status for selected orders</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to update {selectedCount} selected order{selectedCount === 1 ? '' : 's'} to {pendingStatus}?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setConfirmBulkStatusOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          if (!pendingStatus) {
                            setConfirmBulkStatusOpen(false);
                            return;
                          }

                          try {
                            await orderAPI.bulkUpdateOrderStatus(selectedIds, pendingStatus);
                            clearSelection();
                            refetch();
                            setToastMessage(`${selectedCount} order${selectedCount === 1 ? '' : 's'} updated to ${pendingStatus}`);
                          } catch (error) {
                            console.error('Bulk status update failed', error);
                          } finally {
                            setConfirmBulkStatusOpen(false);
                            setPendingStatus(null);
                          }
                        }}
                      >
                        Update {selectedCount} selected
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Drawer */}
      <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusUpdated={refetch} />

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}

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
