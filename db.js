const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DB = {
    async fetchProducts() {
        const { data, error } = await _supabase
            .from('products')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }
        return data;
    },

    async addProduct(product) {
        const { data, error } = await _supabase
            .from('products')
            .insert([product])
            .select();

        if (error) {
            console.error('Error adding product:', error);
            throw error;
        }
        return data[0];
    },

    async updateProduct(id, updates) {
        const { data, error } = await _supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating product:', error);
            throw error;
        }
        return data[0];
    },

    async deleteProduct(id) {
        const { error } = await _supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },

    // orders
    async createOrder(orderData, items) {
        const { data: order, error: orderError } = await _supabase
            .from('orders')
            .insert([{
                customer_name: orderData.customer_name,
                customer_email: orderData.customer_email,
                customer_phone: orderData.customer_phone,
                customer_address: orderData.customer_address,
                delivery_location: orderData.delivery_location
            }])
            .select()
            .single();

        if (orderError) {
            console.error('Error creating order:', orderError);
            throw orderError;
        }

        const orderItems = items.map(item => ({
            order_id: order.id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price
        }));

        const { error: itemsError } = await _supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Error adding order items:', itemsError);
            throw itemsError;
        }

        return order;
    },

    async fetchOrders() {
        const { data, error } = await _supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
        return data;
    },

    async fetchOrderItems(orderId) {
        const { data, error } = await _supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);

        if (error) {
            console.error('Error fetching order items:', error);
            return [];
        }
        return data;
    },

    async updateOrderChecklist(orderId, field, value) {
        const { data, error } = await _supabase
            .from('orders')
            .update({ [field]: value })
            .eq('id', orderId)
            .select()
            .single();

        if (error) {
            console.error('Error updating order:', error);
            throw error;
        }
        return data;
    },

    async markOrderCompleted(orderId) {
        const { data, error } = await _supabase
            .from('orders')
            .update({ completed: true })
            .eq('id', orderId)
            .select()
            .single();

        if (error) {
            console.error('Error completing order:', error);
            throw error;
        }
        return data;
    },

    async deleteOrder(orderId) {
        const { error } = await _supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    }
};
