import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-500">About Us</h3>
            <p className="text-slate-400 text-sm mb-4">
              SMS Tyre Depot has been serving the community since 1995, providing quality tyres and exceptional service.
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/SMSTyreDepot.Official" className="bg-slate-800 p-2 rounded-lg hover:bg-blue-500 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-blue-500 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-blue-500 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-500">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-blue-500 transition-colors">Products</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Tyre Fitting</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Wheel Alignment</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Wheel Balancing</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Tyre Repairs</a></li>
            </ul>
          </div>

          {}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-500">Contact Info</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-1 text-blue-500" />
                <span>+63 917 706 0025</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-1 text-blue-500" />
                <span>smstyredepotlipa@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 text-blue-500" />
                <span>W5V3+79P, J.M Katigbak St., Lipa City, 4217 Batangas</span>
              </li>
            </ul>
          </div>

          {}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-500">Opening Hours</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-1 text-blue-500" />
                <div>
                  <div>Mon - Fri: 8:00 AM - 6:00 PM</div>
                  <div>Saturday: 9:00 AM - 5:00 PM</div>
                  <div>Sunday: Closed</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {}
        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} SMS Tyre Depot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
