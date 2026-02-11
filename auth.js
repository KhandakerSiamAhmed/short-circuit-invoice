
const Auth = {
    async checkSession() {
        if (!_supabase) {
            console.error("Supabase client not initialized. Make sure db.js is loaded first.");
            return;
        }
        const { data: { session } } = await _supabase.auth.getSession();

        if (!session && !window.location.href.includes('login')) {
            window.location.href = '/login';
        }

        if (session && window.location.href.includes('login')) {
            window.location.href = '/invoice';
        }

        return session;
    },

    async login(email, password) {
        const { data, error } = await _supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) throw error;
        return data;
    },

    async logout() {
        const { error } = await _supabase.auth.signOut();
        if (error) throw error;
        window.location.href = '/login';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Auth.checkSession();
});
