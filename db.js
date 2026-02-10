// Initialize Supabase Client
// Ensure supabase-js is loaded before this script
const { createClient } = supabase;

const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DB = {
    // Fetch all products
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

    // Add a new product
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

    // Update a product
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

    // Delete a product
    async deleteProduct(id) {
        const { error } = await _supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }
};
