import supabase from '../config/database.js';
import { sendAppointmentEmail } from '../services/notificationService.js';


export const createAppointment = async (req, res) => {
    const {
        fullName,
        email,
        phone,
        branch,
        serviceType,
        appointmentDate,
        appointmentTime,
        notes
    } = req.body;

    try {
        const { data, error } = await supabase
            .from('appointments')
            .insert({
                user_id: req.user?.id || null, // Optional user ID if logged in
                full_name: fullName,
                email,
                phone,
                branch,
                service_type: serviceType,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                notes,
                status: 'scheduled'
            })
            .select()
            .single();

        if (error) throw error;

        // ---------------------------------------------------------
        // Trigger Real Notifications (Email/SMS)
        // ---------------------------------------------------------
        const notificationResult = await sendAppointmentEmail(data);
        if (!notificationResult.success) {
            console.warn('⚠️  Notification partially failed (see logs above), but appointment was saved.');
        }



        res.status(201).json({
            message: 'Appointment scheduled successfully!',
            appointment: data
        });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({ error: error.message || 'Error scheduling appointment' });
    }
};

export const getAppointments = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('user_id', req.user.id)
            .order('appointment_date', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ error: error.message || 'Error fetching appointments' });
    }
};
