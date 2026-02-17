import { useState } from "react";
import { Calendar, Clock, MapPin, Wrench, Send, CheckCircle2 } from "lucide-react";
import { ScrollAnimation } from "./ui/ScrollAnimation";
import { toast } from "sonner";

const branches = [
    "Mataas Na Lupa, Lipa City",
    "Sabang, Lipa City",
    "San Pablo City, Laguna",
    "Tanauan City, Batangas",
    "Batangas City",
    "Lemery, Batangas",
    "Sto. Tomas, Batangas"
];

const services = [
    "Tyre Fitting",
    "Wheel Alignment",
    "Camber Alignment",
    "Wheel Balancing",
    "Tyre Changing",
    "Vulcanizing",
    "Routine Maintenance"
];

export function AppointmentSection() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        branch: branches[0],
        serviceType: services[0],
        appointmentDate: "",
        appointmentTime: "",
        notes: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem("token");

            const response = await fetch("/api/appointments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` })
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsSuccess(true);
                toast.success("Appointment scheduled! Check your email/SMS for details.");
            } else {
                let errorMessage = "Failed to schedule appointment";
                try {
                    const data = await response.json();
                    errorMessage = data.error || errorMessage;
                } catch (e) {
                    // If response is not JSON (e.g. HTML error page)
                    console.error("Failed to parse error response:", e);
                }
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error("Booking error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <section id="appointment" className="py-24 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4 max-w-2xl text-center">
                    <ScrollAnimation variant="fade-up">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">See You Soon!</h2>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            Your appointment has been scheduled. We've sent a confirmation message to your email and phone with all the details.
                        </p>
                        <button
                            onClick={() => {
                                setIsSuccess(false);
                                setFormData({ ...formData, appointmentDate: "", appointmentTime: "" });
                            }}
                            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                        >
                            Book Another
                        </button>
                    </ScrollAnimation>
                </div>
            </section>
        );
    }

    return (
        <section id="appointment" className="py-24 bg-slate-50 border-t border-slate-200">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col lg:flex-row border border-slate-100">
                    {/* Left Side: Info */}
                    <div className="lg:w-1/3 bg-slate-900 p-12 text-white flex flex-col justify-between">
                        <div>
                            <span className="text-blue-400 font-bold tracking-widest text-[10px] uppercase mb-4 block">Quick Booking</span>
                            <h2 className="text-3xl font-bold mb-6 tracking-tight leading-tight">
                                Ready for a <br />Better Ride?
                            </h2>
                            <p className="text-slate-400 mb-12 text-sm leading-relaxed">
                                Schedule your service in seconds. Pick your preferred branch and let our experts take care of the rest.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { icon: CheckCircle2, text: "No Waiting in Line" },
                                    { icon: CheckCircle2, text: "Certified Technicians" },
                                    { icon: CheckCircle2, text: "Email & SMS Notifications" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        <item.icon className="w-4 h-4 text-blue-400" />
                                        <span className="text-slate-300">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-12 pt-12 border-t border-slate-800">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Need help?</p>
                            <p className="text-lg font-bold text-white">+63 917 706 0025</p>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="lg:w-2/3 p-12">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="john@example.com"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="0917 123 4567"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preferred Branch</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm appearance-none"
                                        value={formData.branch}
                                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                    >
                                        {branches.map(b => <option key={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service Type</label>
                                <div className="relative">
                                    <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm appearance-none"
                                        value={formData.serviceType}
                                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                    >
                                        {services.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required
                                            type="date"
                                            className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                            value={formData.appointmentDate}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required
                                            type="time"
                                            className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                            value={formData.appointmentTime}
                                            onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Additional Notes</label>
                                <textarea
                                    placeholder="Tell us more about your vehicle (e.g., Toyota Vios white)..."
                                    rows={3}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm resize-none"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-2 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:bg-slate-200 disabled:shadow-none group"
                                >
                                    {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
                                    <Send className={`w-5 h-5 transition-transform ${isSubmitting ? 'scale-0' : 'group-hover:translate-x-1 group-hover:-translate-y-1'}`} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
