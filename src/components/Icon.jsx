import {
  Rotate3d, Orbit, MapPin, LayoutGrid, Glasses, Map, Share2, Box, Ruler, HardHat, Tags, FileBox,
  Building2, ShieldCheck, Code2, MonitorSmartphone, Zap, Search, LayoutDashboard, LifeBuoy, Home,
  BedDouble, ShoppingBag, GraduationCap, Landmark, Target, Eye, Sparkles, Hand,
  Sofa, Car, UtensilsCrossed, Baby, Dumbbell, Palmtree, Flower2, Stethoscope, Briefcase, PartyPopper, Factory,
} from 'lucide-react'

// Icons referenced by name from content.js
const registry = {
  Rotate3d, Orbit, MapPin, LayoutGrid, Glasses, Map, Share2, Box, Ruler, HardHat, Tags, FileBox,
  Building2, ShieldCheck, Code2, MonitorSmartphone, Zap, Search, LayoutDashboard, LifeBuoy, Home,
  BedDouble, ShoppingBag, GraduationCap, Landmark, Target, Eye, Sparkles, Hand,
  Sofa, Car, UtensilsCrossed, Baby, Dumbbell, Palmtree, Flower2, Stethoscope, Briefcase, PartyPopper, Factory,
}

export default function Icon({ name, ...props }) {
  const Cmp = registry[name] ?? Sparkles
  return <Cmp aria-hidden="true" strokeWidth={1.75} {...props} />
}
