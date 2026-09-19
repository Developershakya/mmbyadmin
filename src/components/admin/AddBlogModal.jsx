import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Search,
  MapPin,
  Clock,
  Star,
  Navigation,
  Utensils,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Bus as BusIcon,
  Car,
  Landmark
} from 'lucide-react';
import RouteIcon from '../common/RouteIcon.jsx';
import IconPickerModal from './IconPickerModal.jsx';
import RouteMapLeaflet from '../blog/RouteMapLeaflet.jsx';
import SafeImage from '../common/SafeImage.jsx';

export default function AddBlogModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  categories = []
}) {
  // Main form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    blogType: 'destination', // 'destination' | 'top_list' | 'food'
    category: 'Destinations',
    status: 'Published',
    author: 'Bharat Yatra Editorial',
    readTime: '6 min read',
    rating: '4.8',
    coverImage: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?q=80&w=1200&auto=format&fit=crop',
    excerpt: '',
    content: '',
    journeyRoute: [],
    journeyStats: {
      totalDistance: '163 km',
      totalTime: '3h 45m',
      travelMode: '🚗 By Car / Express Highway',
      tripDuration: '4 Days / 3 Nights'
    },
    placesExplored: [],
    placesCovered: [],
    topItems: [],
    highlights: [],
    quickInfo: [],
    foodDishes: [],
    foodPlaces: [],
    tips: [],
    tipsImage: '',
    experience: {
      quote: '',
      photos: []
    },
    tripSnapshot: {
      days: '4',
      places: '9',
      distance: '163 km',
      spend: '₹ 3,250'
    }
  });

  // Autocomplete search states
  const [sightseeingQuery, setSightseeingQuery] = useState('');
  const [sightseeingResults, setSightseeingResults] = useState([]);
  const [searchingSightseeing, setSearchingSightseeing] = useState(false);
  const [allSightseeingSuggestions, setAllSightseeingSuggestions] = useState([]);
  const [selectedSightseeingCityFilter, setSelectedSightseeingCityFilter] = useState('ALL');
  const [loadingSightseeingSuggestions, setLoadingSightseeingSuggestions] = useState(false);

  const [routeQuery, setRouteQuery] = useState('');
  const [routeResults, setRouteResults] = useState([]);
  const [searchingRoute, setSearchingRoute] = useState(false);

  // Icon Picker & Route Distances State
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState(null);
  const [calculatingDistances, setCalculatingDistances] = useState(false);

  // Active tab in builder
  const [activeBuilderTab, setActiveBuilderTab] = useState('general'); // 'general' | 'places' | 'route' | 'type_specific' | 'tips'

  // Pre-load all available sightseeing suggestions whenever modal is open
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    async function fetchAllSightseeing() {
      setLoadingSightseeingSuggestions(true);
      try {
        const res = await fetch('/api/sightseeing/search?city=ALL');
        const json = await res.json();
        if (!isCancelled && json.success && (json.sightseeing || json.data)) {
          const list = json.sightseeing || json.data;
          setAllSightseeingSuggestions(list);
          if (!sightseeingQuery.trim()) {
            setSightseeingResults(list);
          }
        }
      } catch (err) {
        console.warn('Could not pre-load sightseeing places:', err);
      } finally {
        if (!isCancelled) setLoadingSightseeingSuggestions(false);
      }
    }

    fetchAllSightseeing();
    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  // Initialize or prefill on open/edit
  useEffect(() => {
    if (initialData) {
      const normalizedRoute = (Array.isArray(initialData.journeyRoute) ? initialData.journeyRoute : []).map((step, idx) => ({
        id: step.id || `chk_${idx}_${Date.now()}`,
        name: step.name || `Stop ${idx + 1}`,
        latitude: typeof step.latitude === 'number' ? step.latitude : parseFloat(step.latitude || step.lat) || (idx === 0 ? 28.6139 : idx === 1 ? 27.4924 : 27.5807),
        longitude: typeof step.longitude === 'number' ? step.longitude : parseFloat(step.longitude || step.lng) || (idx === 0 ? 77.2090 : idx === 1 ? 77.6737 : 77.7006),
        time: step.time || (idx === 0 ? '08:00 AM' : '12:00 PM'),
        distance: step.distance || (idx === 0 ? 'Start' : ''),
        type: step.type || (idx === 0 ? 'start' : 'transit'),
        icon: step.icon || (idx === 0 ? 'MapPin' : 'Landmark'),
        iconLibrary: step.iconLibrary || 'lucide',
        sourceType: step.sourceType || 'CITY',
        order: typeof step.order === 'number' ? step.order : idx
      }));

      const rawExplored = Array.isArray(initialData.placesExplored) ? initialData.placesExplored : [];
      const rawCovered = Array.isArray(initialData.placesCovered) ? initialData.placesCovered : [];
      const combinedPlaces = rawExplored.length > 0 ? rawExplored : (rawCovered.length > 0 ? rawCovered : []);

      setFormData({
        ...initialData,
        journeyRoute: normalizedRoute,
        placesExplored: combinedPlaces,
        placesCovered: combinedPlaces,
        topItems: Array.isArray(initialData.topItems) ? initialData.topItems : [],
        foodDishes: Array.isArray(initialData.foodDishes) ? initialData.foodDishes : [],
        foodPlaces: Array.isArray(initialData.foodPlaces) ? initialData.foodPlaces : [],
        tips: Array.isArray(initialData.tips) ? initialData.tips : [],
        experience: initialData.experience || { quote: '', photos: [] },
        tripSnapshot: initialData.tripSnapshot || { days: '4', places: '6', distance: '158.5 km', spend: '₹ 2,500' },
        journeyStats: initialData.journeyStats || { totalDistance: '158.5 km', totalTime: '2h 07m', travelMode: '🚗 By Car / Expressway' }
      });
    } else {
      // Default empty state with valid coordinates
      setFormData({
        title: '',
        slug: '',
        blogType: 'destination',
        category: categories[0]?.name || 'Destinations',
        status: 'Published',
        author: 'Bharat Yatra Editorial',
        readTime: '6 min read',
        rating: '4.8',
        coverImage: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?q=80&w=1200&auto=format&fit=crop',
        excerpt: '',
        content: '',
        journeyRoute: [
          {
            id: 'chk_1',
            name: 'Delhi',
            latitude: 28.6139,
            longitude: 77.2090,
            time: '08:00 AM',
            distance: 'Start',
            icon: 'MapPin',
            iconLibrary: 'lucide',
            type: 'start',
            sourceType: 'CITY',
            order: 0
          },
          {
            id: 'chk_2',
            name: 'Mathura',
            latitude: 27.4924,
            longitude: 77.6737,
            time: '11:45 AM',
            distance: '146.9 km',
            icon: 'Bus',
            iconLibrary: 'lucide',
            type: 'transit',
            sourceType: 'CITY',
            order: 1
          },
          {
            id: 'chk_3',
            name: 'Vrindavan',
            latitude: 27.5807,
            longitude: 77.7006,
            time: '01:00 PM',
            distance: '11.6 km',
            icon: 'Landmark',
            iconLibrary: 'lucide',
            type: 'destination',
            sourceType: 'CITY',
            order: 2
          }
        ],
        journeyStats: {
          totalDistance: '158.5 km',
          totalTime: '2h 07m',
          travelMode: '🚗 By Car / Expressway',
          tripDuration: '2 Days / 1 Night'
        },
        placesExplored: [
          {
            name: 'Banke Bihari Temple',
            city: 'Vrindavan',
            image: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?q=80&w=400&auto=format&fit=crop',
            rating: '4.9',
            timing: '07:30 AM – 12:00 PM',
            description: 'The holiest and most vibrant temple dedicated to Lord Krishna in the heart of Vrindavan.'
          }
        ],
        placesCovered: [
          {
            name: 'Banke Bihari Temple',
            city: 'Vrindavan',
            image: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?q=80&w=400&auto=format&fit=crop',
            rating: '4.9',
            timing: '07:30 AM – 12:00 PM',
            description: 'The holiest and most vibrant temple dedicated to Lord Krishna in the heart of Vrindavan.'
          }
        ],
        topItems: [],
        highlights: [
          'Best season and weather insights',
          'Hidden serene viewpoints',
          'Verified local transportation guide'
        ],
        quickInfo: [
          { label: 'Best Time to Visit', value: 'October to March' },
          { label: 'Ideal Duration', value: '3 – 4 Days' },
          { label: 'Trip Budget', value: '₹ 5,000 – ₹ 9,000' },
          { label: 'Difficulty Level', value: 'Easy' }
        ],
        foodDishes: [],
        foodPlaces: [],
        tips: [
          'Visit popular shrines during early morning aarti to avoid peak congestion.',
          'Keep footwear in dedicated storage outside temple complexes.'
        ],
        tipsImage: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop',
        experience: {
          quote: 'A spiritually revitalizing journey that leaves a lasting impression on your soul.',
          photos: [
            'https://images.unsplash.com/photo-1544717302-de2939b7ef71?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621600411688-4be93cd68504?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400&auto=format&fit=crop'
          ]
        },
        tripSnapshot: {
          days: '3',
          places: '6',
          distance: '160 km',
          spend: '₹ 4,500'
        }
      });
    }
  }, [initialData, isOpen]);

  // Dynamic slug generator
  const handleTitleChange = (val) => {
    const newSlug = val
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData(prev => ({
      ...prev,
      title: val,
      slug: initialData ? prev.slug : newSlug
    }));
  };

  const routeAbortRef = useRef(null);
  const sightseeingAbortRef = useRef(null);

  // Extract unique cities available in sightseeing database
  const availableSightseeingCities = React.useMemo(() => {
    const set = new Set();
    (allSightseeingSuggestions || []).forEach(s => {
      const c = (s.cityName || s.city || '').trim();
      if (c) set.add(c);
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [allSightseeingSuggestions]);

  // Filter helper: returns matching suggestions from allSightseeingSuggestions
  const getFilteredSightseeingSuggestions = (query = '', cityFilter = 'ALL') => {
    let list = allSightseeingSuggestions || [];
    if (cityFilter && cityFilter !== 'ALL') {
      list = list.filter(item => {
        const c = (item.cityName || item.city || item.location || '').toLowerCase();
        return c.includes(cityFilter.toLowerCase());
      });
    }
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(item => {
        const n = (item.name || '').toLowerCase();
        const c = (item.cityName || item.city || item.location || '').toLowerCase();
        const s = (item.state || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        return n.includes(q) || c.includes(q) || s.includes(q) || cat.includes(q);
      });
    }
    return list;
  };

  // Sightseeing Autocomplete & Instant Suggestions with city filtering
  useEffect(() => {
    if (formData.blogType === 'food') {
      setSightseeingResults([]);
      setSearchingSightseeing(false);
      return;
    }

    if (!sightseeingQuery.trim()) {
      // Show full suggestions matching current city filter
      setSightseeingResults(getFilteredSightseeingSuggestions('', selectedSightseeingCityFilter));
      setSearchingSightseeing(false);
      return;
    }

    // Instantly filter pre-loaded list so user gets immediate 0ms response
    const instantMatches = getFilteredSightseeingSuggestions(sightseeingQuery, selectedSightseeingCityFilter);
    setSightseeingResults(instantMatches);

    if (sightseeingAbortRef.current) {
      sightseeingAbortRef.current.abort();
    }
    const controller = new AbortController();
    sightseeingAbortRef.current = controller;

    setSearchingSightseeing(true);
    const timer = setTimeout(async () => {
      try {
        const cityParam = selectedSightseeingCityFilter !== 'ALL' ? `&city=${encodeURIComponent(selectedSightseeingCityFilter)}` : '';
        const res = await fetch(`/api/sightseeing/search?q=${encodeURIComponent(sightseeingQuery.trim())}${cityParam}`, {
          signal: controller.signal
        });
        if (!res.ok) throw new Error('Search failed');
        const json = await res.json();
        if (json.success && (json.sightseeing || json.data)) {
          const apiList = json.sightseeing || json.data;
          // Merge API results with instant matches, avoiding duplicates
          const seen = new Set();
          const combined = [];
          [...apiList, ...instantMatches].forEach(item => {
            const key = item.id || item.name;
            if (!seen.has(key)) {
              seen.add(key);
              combined.push(item);
            }
          });
          setSightseeingResults(combined);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Sightseeing search error:', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchingSightseeing(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [sightseeingQuery, selectedSightseeingCityFilter, allSightseeingSuggestions, formData.blogType]);

  // Route Autocomplete Query with debounce, cancellation, and food-blog exemption
  useEffect(() => {
    if (formData.blogType === 'food') {
      setRouteResults([]);
      setSearchingRoute(false);
      return;
    }

    if (!routeQuery.trim() || routeQuery.trim().length < 2) {
      setRouteResults([]);
      setSearchingRoute(false);
      return;
    }

    if (routeAbortRef.current) {
      routeAbortRef.current.abort();
    }
    const controller = new AbortController();
    routeAbortRef.current = controller;

    setSearchingRoute(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/route/search?q=${encodeURIComponent(routeQuery.trim())}`, {
          signal: controller.signal
        });
        if (!res.ok) throw new Error('Search failed');
        const json = await res.json();
        if (json.success && Array.isArray(json.results)) {
          setRouteResults(json.results);
        } else {
          setRouteResults([]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Route location search error:', err);
          setRouteResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchingRoute(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [routeQuery, formData.blogType]);

  // Recalculate real road distances and durations using OSRM
  const recalculateRouteStats = async (routeList) => {
    if (formData.blogType === 'food') return;

    const list = routeList || formData.journeyRoute;
    const validWps = (list || []).filter(
      w => typeof w.latitude === 'number' && !isNaN(w.latitude) &&
           typeof w.longitude === 'number' && !isNaN(w.longitude)
    );

    if (validWps.length < 2) return;

    try {
      setCalculatingDistances(true);
      const resp = await fetch('/api/route/directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waypoints: validWps.map(w => ({
            name: w.name,
            latitude: w.latitude,
            longitude: w.longitude
          }))
        })
      });
      const data = await resp.json();
      if (data.success) {
        setFormData(prev => {
          const updatedRoute = (prev.journeyRoute || []).map((step, idx) => {
            if (idx === 0) {
              return { ...step, distance: 'Start' };
            }
            const seg = data.segments?.[idx - 1];
            return {
              ...step,
              distance: seg?.distance || step.distance || ''
            };
          });

          return {
            ...prev,
            journeyRoute: updatedRoute,
            journeyStats: {
              ...prev.journeyStats,
              totalDistance: data.totalDistance || prev.journeyStats?.totalDistance,
              totalTime: data.totalDuration || prev.journeyStats?.totalTime
            }
          };
        });
      }
    } catch (err) {
      console.warn('Error recalculating route distances:', err);
    } finally {
      setCalculatingDistances(false);
    }
  };

  // Handler: Add Route Stop from Search (Entire card or button click, with duplicate protection)
  const handleAddRouteStop = (item) => {
    if (!item) return;
    const name = item.name || routeQuery;
    const isAlreadyAdded = (formData.journeyRoute || []).some(
      w => w.name && w.name.toLowerCase() === name.toLowerCase()
    );
    if (isAlreadyAdded) return;

    const isFirst = (formData.journeyRoute || []).length === 0;
    const newStop = {
      id: `chk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: name,
      latitude: parseFloat(item.latitude),
      longitude: parseFloat(item.longitude),
      time: isFirst ? '08:00 AM' : '12:30 PM',
      distance: isFirst ? 'Start' : '',
      icon: item.icon || (isFirst ? 'MapPin' : 'Landmark'),
      iconLibrary: item.iconLibrary || 'lucide',
      type: isFirst ? 'start' : 'transit',
      sourceType: item.sourceType || item.category || 'CITY',
      order: (formData.journeyRoute || []).length
    };

    const updatedRoute = [...(formData.journeyRoute || []), newStop];
    setFormData(prev => ({
      ...prev,
      journeyRoute: updatedRoute
    }));

    setRouteQuery('');
    setRouteResults([]);

    // Recalculate distances automatically
    recalculateRouteStats(updatedRoute);
  };

  // Handler: Add Sightseeing Place from Search (Entire card or button click, with duplicate protection)
  const handleAddSightseeingPlace = (sight) => {
    if (!sight) return;
    const name = sight.name || sight.sightseeingName || 'Attraction';
    const isAlreadyAdded = (formData.placesExplored || []).some(
      p => (p.name && p.name.toLowerCase() === name.toLowerCase()) ||
           (p.sightseeingId && p.sightseeingId === sight.id)
    ) || (formData.placesCovered || []).some(
      p => (p.name && p.name.toLowerCase() === name.toLowerCase()) ||
           (p.sightseeingId && p.sightseeingId === sight.id)
    );
    if (isAlreadyAdded) return;

    const newPlace = {
      id: `plc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      sightseeingId: sight.id,
      name,
      city: sight.cityName || sight.city || sight.location || formData.destination || '',
      rating: sight.rating ? String(sight.rating) : '4.8',
      timing: sight.timing || (sight.openingTime && sight.closingTime ? `${sight.openingTime} – ${sight.closingTime}` : '09:00 AM – 06:00 PM'),
      image: sight.image || sight.photo || 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?q=80&w=400',
      description: sight.description || sight.shortDescription || sight.masterDescription || `Iconic attraction in ${sight.cityName || sight.city || formData.destination || 'the region'}.`
    };

    setFormData(prev => {
      const updatedExplored = [...(prev.placesExplored || []), newPlace];
      const updatedCovered = [...(prev.placesCovered || []), newPlace];
      return {
        ...prev,
        placesExplored: updatedExplored,
        placesCovered: updatedCovered
      };
    });
  };

  // Handler: Delete Place from both placesExplored and placesCovered
  const handleDeletePlace = (index) => {
    setFormData(prev => ({
      ...prev,
      placesExplored: (prev.placesExplored || []).filter((_, i) => i !== index),
      placesCovered: (prev.placesCovered || []).filter((_, i) => i !== index)
    }));
  };

  // Handler: Move Place Up / Down in List (especially useful for Top 10 rankings)
  const handleMovePlace = (index, direction) => {
    setFormData(prev => {
      const list = [...(prev.placesExplored || prev.placesCovered || [])];
      const target = index + direction;
      if (target < 0 || target >= list.length) return prev;
      const temp = list[index];
      list[index] = list[target];
      list[target] = temp;
      return {
        ...prev,
        placesExplored: list,
        placesCovered: list
      };
    });
  };

  // Handler: Add Custom Route Stop
  const handleAddCustomStop = () => {
    const isFirst = formData.journeyRoute.length === 0;
    const newStop = {
      id: `chk_${Date.now()}_custom`,
      name: 'New Checkpoint',
      latitude: 27.5807,
      longitude: 77.7006,
      time: isFirst ? '08:00 AM' : '02:00 PM',
      distance: isFirst ? 'Start' : '25 km',
      icon: 'MapPin',
      iconLibrary: 'lucide',
      type: isFirst ? 'start' : 'transit',
      sourceType: 'CUSTOM',
      order: formData.journeyRoute.length
    };

    const updatedRoute = [...formData.journeyRoute, newStop];
    setFormData(prev => ({
      ...prev,
      journeyRoute: updatedRoute
    }));

    recalculateRouteStats(updatedRoute);
  };

  // Handler: Move step up or down
  const handleMoveStep = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= formData.journeyRoute.length) return;

    const updated = [...formData.journeyRoute];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((step, idx, arr) => ({
      ...step,
      order: idx,
      type: idx === 0 ? 'start' : idx === arr.length - 1 ? 'destination' : (step.type === 'start' || step.type === 'destination' ? 'transit' : step.type)
    }));

    setFormData(prev => ({
      ...prev,
      journeyRoute: reordered
    }));

    recalculateRouteStats(reordered);
  };

  // Handler: Delete step
  const handleDeleteStep = (index) => {
    const updated = formData.journeyRoute.filter((_, i) => i !== index).map((step, idx, arr) => ({
      ...step,
      order: idx,
      type: idx === 0 ? 'start' : idx === arr.length - 1 ? 'destination' : step.type
    }));

    setFormData(prev => ({
      ...prev,
      journeyRoute: updated
    }));

    recalculateRouteStats(updated);
  };

  // Handler: Select Icon for Step
  const handleSelectIconForStep = ({ icon, iconLibrary }) => {
    if (selectedStepIndex === null) return;
    setFormData(prev => {
      const updated = [...prev.journeyRoute];
      if (updated[selectedStepIndex]) {
        updated[selectedStepIndex] = {
          ...updated[selectedStepIndex],
          icon,
          iconLibrary
        };
      }
      return { ...prev, journeyRoute: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please provide an article title');
      return;
    }
    const finalPlaces = (formData.placesExplored && formData.placesExplored.length > 0)
      ? formData.placesExplored
      : (formData.placesCovered || []);

    const payload = {
      ...formData,
      placesExplored: finalPlaces,
      placesCovered: finalPlaces
    };
    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F97316]" />
              <span>{initialData ? 'Edit Blog Article' : 'Create Dynamic Blog Article'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configured with dynamic Sightseeing, Bus/Cab Route integrations, and rich category templates
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Builder Tab Nav */}
        <div className="flex items-center gap-1 border-b border-slate-200 pt-3 pb-2 shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveBuilderTab('general')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeBuilderTab === 'general' ? 'bg-[#F97316] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1. Basic &amp; SEO
          </button>

          {formData.blogType !== 'food' && (
            <>
              <button
                type="button"
                onClick={() => setActiveBuilderTab('route')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeBuilderTab === 'route' ? 'bg-[#F97316] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>2. Journey Route ({formData.journeyRoute.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveBuilderTab('places')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeBuilderTab === 'places' ? 'bg-[#F97316] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  3. {formData.blogType === 'top_list' ? 'Places Covered (Top List)' : 'Places I Explored'} ({formData.placesCovered?.length || formData.placesExplored?.length || 0})
                </span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setActiveBuilderTab('type_specific')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeBuilderTab === 'type_specific' ? 'bg-[#F97316] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{formData.blogType === 'food' ? '2. Food & Dishes' : `4. Type Details (${formData.blogType})`}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveBuilderTab('tips')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeBuilderTab === 'tips' ? 'bg-[#F97316] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {formData.blogType === 'food' ? '3. Snapshot & Tips' : '5. Snapshot & Tips'}
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-5 px-1 space-y-6">
          {/* TAB 1: General & SEO */}
          {activeBuilderTab === 'general' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Vrindavan – A Divine Escape: 4 Days Spiritual Journey"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Blog Type *
                  </label>
                  <select
                    value={formData.blogType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setFormData(prev => ({ ...prev, blogType: newType }));
                      if (newType === 'food' && (activeBuilderTab === 'route' || activeBuilderTab === 'places')) {
                        setActiveBuilderTab('type_specific');
                      }
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="destination">Destination Travelogue</option>
                    <option value="top_list">Top 10 / Top 5 Curated List</option>
                    <option value="food">Food &amp; Culinary Trail</option>
                  </select>
                  {formData.blogType === 'food' && (
                    <p className="text-[10px] text-amber-700 bg-amber-50 rounded-lg p-1.5 mt-1 border border-amber-200/80 leading-tight">
                      Food &amp; Culinary Trail focuses on cuisine, dishes, and culinary spots. Journey Route and Places are hidden.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    <option value="Destinations">Destinations</option>
                    <option value="Spiritual Journey">Spiritual Journey</option>
                    <option value="Food & Cuisine">Food &amp; Cuisine</option>
                    <option value="Travel Tips">Travel Tips</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Published">Published (Live on Website)</option>
                    <option value="Draft">Draft (Admin Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Slug
                </label>
                <div className="flex items-center">
                  <span className="h-10 px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs text-slate-500 flex items-center">
                    /blogs/
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="vrindavan-divine-escape"
                    className="flex-1 h-10 px-3.5 rounded-r-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cover Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                {formData.coverImage && (
                  <div className="mt-2 aspect-21/9 max-h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <SafeImage
                      src={formData.coverImage}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      placeholderText="Cover image not available"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Excerpt / Lead Intro *
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Spent 4 peaceful days exploring temples, experiencing the divine vibes and living the spiritual side of life..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Article Body / Content
                </label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the comprehensive narrative, travel advice, or local background..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Journey Route (Real Coordinates, Icon Picker, OSRM Recalculation & Leaflet Preview) */}
          {formData.blogType !== 'food' && activeBuilderTab === 'route' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Top Search Card */}
              <div className="bg-linear-to-br from-orange-50/90 to-amber-50/60 border border-orange-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-orange-900 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-[#F97316]" />
                    <span>Search Verified Locations &amp; Highway Stops</span>
                  </h4>
                  <span className="text-[10px] font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                    OSRM &amp; GPS Powered
                  </span>
                </div>
                <p className="text-[11px] text-orange-800/80 mt-1">
                  Search across verified cities, bus terminals, cab points, and monuments. Click anywhere on a suggestion or <strong>+ Add to Route</strong> to automatically pin coordinates and calculate driving distances.
                </p>

                {/* Autocomplete Input */}
                <div className="relative mt-3">
                  <div className="flex items-center bg-white rounded-xl border border-orange-300 shadow-2xs overflow-hidden px-3 py-2">
                    <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={routeQuery}
                      onChange={(e) => setRouteQuery(e.target.value)}
                      placeholder="Search a city, bus hub, or monument (e.g. Delhi, Mathura, Agra, Taj Mahal)..."
                      className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
                    />
                    {searchingRoute && (
                      <div className="flex items-center gap-1.5 text-[10px] text-orange-600 font-semibold shrink-0">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Searching...</span>
                      </div>
                    )}
                  </div>

                  {routeResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-30 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {routeResults.map((item, idx) => {
                        const isAlreadyAdded = (formData.journeyRoute || []).some(
                          w => w.name && w.name.toLowerCase() === (item.name || '').toLowerCase()
                        );
                        const badgeColor =
                          item.category === 'TRANSPORT_HUB' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          item.category === 'CAB' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          item.category === 'SIGHTSEEING' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          'bg-blue-100 text-blue-800 border-blue-200';

                        const categoryLabel =
                          item.category === 'TRANSPORT_HUB' ? '🚌 Bus Terminal' :
                          item.category === 'CAB' ? '🚕 Cab Hub' :
                          item.category === 'SIGHTSEEING' ? '🏛️ Sightseeing' :
                          '📍 City';

                        return (
                          <div
                            key={idx}
                            onClick={() => !isAlreadyAdded && handleAddRouteStop(item)}
                            className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                              isAlreadyAdded
                                ? 'bg-slate-50 opacity-75 cursor-default'
                                : 'hover:bg-orange-50/80 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                                <RouteIcon icon={item.icon || 'MapPin'} className="w-3.5 h-3.5 text-[#F97316]" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-slate-900 truncate">{item.name}</span>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badgeColor}`}>
                                    {categoryLabel}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                  {item.subtitle || `${Number(item.latitude).toFixed(3)}°N, ${Number(item.longitude).toFixed(3)}°E`}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={isAlreadyAdded}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isAlreadyAdded) handleAddRouteStop(item);
                              }}
                              className={`text-[11px] px-3 py-1 rounded-lg font-bold transition-all shrink-0 shadow-xs ${
                                isAlreadyAdded
                                  ? 'bg-slate-200 text-slate-500 cursor-default'
                                  : 'bg-[#F97316] hover:bg-[#EA580C] text-white cursor-pointer active:scale-95'
                              }`}
                            >
                              {isAlreadyAdded ? '✓ Added' : '+ Add to Route'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!searchingRoute && routeQuery.trim().length >= 2 && routeResults.length === 0 && (
                    <div className="absolute top-full left-0 right-0 z-30 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 p-4 text-center">
                      <p className="text-xs text-slate-500">No matching locations found for "{routeQuery}".</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Journey Route Steps */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Route Checkpoints ({formData.journeyRoute.length})
                    </h4>
                    {calculatingDistances && (
                      <span className="text-[10px] text-[#F97316] font-semibold flex items-center gap-1 animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Updating road distances...</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => recalculateRouteStats()}
                      disabled={calculatingDistances || formData.journeyRoute.length < 2}
                      className="text-xs font-bold text-slate-700 hover:text-[#F97316] bg-slate-100 hover:bg-orange-50 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      title="Recalculate real driving distances with OSRM"
                    >
                      <RefreshCw className={`w-3 h-3 ${calculatingDistances ? 'animate-spin' : ''}`} />
                      <span>Recalculate (OSRM)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomStop}
                      className="text-xs font-bold text-white bg-[#F97316] hover:bg-[#EA580C] px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Custom Stop</span>
                    </button>
                  </div>
                </div>

                {formData.journeyRoute.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
                    <p className="text-xs text-slate-500">No checkpoints added yet. Search above or add a custom stop.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {formData.journeyRoute.map((step, sIdx) => {
                      const hasCoords = typeof step.latitude === 'number' && !isNaN(step.latitude) &&
                                        typeof step.longitude === 'number' && !isNaN(step.longitude);

                      return (
                        <div
                          key={step.id || sIdx}
                          className="bg-white border border-slate-200/90 hover:border-orange-300 rounded-xl p-3 shadow-2xs transition-all space-y-2.5"
                        >
                          {/* Row 1: Order, Icon, Name, Stop Type, Reorder & Delete */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                              {/* Reorder Buttons */}
                              <div className="flex flex-col gap-0.5">
                                <button
                                  type="button"
                                  disabled={sIdx === 0}
                                  onClick={() => handleMoveStep(sIdx, -1)}
                                  className="p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={sIdx === formData.journeyRoute.length - 1}
                                  onClick={() => handleMoveStep(sIdx, 1)}
                                  className="p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Index badge */}
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {sIdx + 1}
                              </span>

                              {/* Icon Button (Opens IconPickerModal) */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStepIndex(sIdx);
                                  setIconPickerOpen(true);
                                }}
                                className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 hover:border-orange-400 text-[#F97316] flex items-center justify-center shrink-0 cursor-pointer transition-colors shadow-2xs group"
                                title="Click to choose icon"
                              >
                                <RouteIcon icon={step.icon || 'MapPin'} iconLibrary={step.iconLibrary} className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              </button>

                              {/* Name input */}
                              <input
                                type="text"
                                value={step.name}
                                onChange={(e) => {
                                  const updated = [...formData.journeyRoute];
                                  updated[sIdx].name = e.target.value;
                                  setFormData({ ...formData, journeyRoute: updated });
                                }}
                                placeholder="Location or Stop Name"
                                className="text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 flex-1 focus:ring-1 focus:ring-orange-500 focus:bg-white"
                              />
                            </div>

                            {/* Stop Type Selector */}
                            <div className="flex items-center gap-2">
                              <select
                                value={step.type || (sIdx === 0 ? 'start' : sIdx === formData.journeyRoute.length - 1 ? 'destination' : 'transit')}
                                onChange={(e) => {
                                  const updated = [...formData.journeyRoute];
                                  updated[sIdx].type = e.target.value;
                                  setFormData({ ...formData, journeyRoute: updated });
                                }}
                                className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-hidden"
                              >
                                <option value="start">🚩 Start / Origin</option>
                                <option value="transit">🛣️ Highway Transit</option>
                                <option value="stop">🛑 Food / Rest Stop</option>
                                <option value="destination">🏁 Final Destination</option>
                                <option value="sightseeing">🏛️ Sightseeing Point</option>
                                <option value="hotel">🏨 Hotel / Stay</option>
                              </select>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteStep(sIdx)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Remove this checkpoint"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Row 2: GPS Coordinates, Time, and Distance */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                            {/* Latitude */}
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                              <span className="text-[10px] font-bold text-slate-400">LAT</span>
                              <input
                                type="number"
                                step="any"
                                value={step.latitude ?? ''}
                                onChange={(e) => {
                                  const updated = [...formData.journeyRoute];
                                  updated[sIdx].latitude = parseFloat(e.target.value) || 0;
                                  setFormData({ ...formData, journeyRoute: updated });
                                }}
                                placeholder="28.6139"
                                className="w-full text-[11px] text-slate-800 bg-transparent focus:outline-hidden font-mono"
                              />
                            </div>

                            {/* Longitude */}
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                              <span className="text-[10px] font-bold text-slate-400">LON</span>
                              <input
                                type="number"
                                step="any"
                                value={step.longitude ?? ''}
                                onChange={(e) => {
                                  const updated = [...formData.journeyRoute];
                                  updated[sIdx].longitude = parseFloat(e.target.value) || 0;
                                  setFormData({ ...formData, journeyRoute: updated });
                                }}
                                placeholder="77.2090"
                                className="w-full text-[11px] text-slate-800 bg-transparent focus:outline-hidden font-mono"
                              />
                              {hasCoords && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Valid GPS" />
                              )}
                            </div>

                            {/* Time */}
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <input
                                type="text"
                                value={step.time || ''}
                                onChange={(e) => {
                                  const updated = [...formData.journeyRoute];
                                  updated[sIdx].time = e.target.value;
                                  setFormData({ ...formData, journeyRoute: updated });
                                }}
                                placeholder="08:00 AM"
                                className="w-full text-[11px] text-slate-800 bg-transparent focus:outline-hidden"
                              />
                            </div>

                            {/* Distance */}
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                              <span className="text-[10px] font-bold text-slate-400">DIST</span>
                              <input
                                type="text"
                                value={step.distance || ''}
                                onChange={(e) => {
                                  const updated = [...formData.journeyRoute];
                                  updated[sIdx].distance = e.target.value;
                                  setFormData({ ...formData, journeyRoute: updated });
                                }}
                                placeholder={sIdx === 0 ? 'Start' : '15 km'}
                                className="w-full text-[11px] text-slate-800 bg-transparent focus:outline-hidden"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Real Leaflet Map Preview inside Admin */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">🗺️ Real Route Map Preview</span>
                    <span className="text-[10px] font-medium text-slate-500">(OpenStreetMap + OSRM Road Polyline)</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#F97316] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                    Live Sync
                  </span>
                </div>

                <RouteMapLeaflet
                  route={formData.journeyRoute}
                  stats={formData.journeyStats}
                  height="260px"
                  title="Route Road Alignment"
                />
              </div>

              {/* Journey Route Stats Strip */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Total Road Distance
                  </label>
                  <input
                    type="text"
                    value={formData.journeyStats.totalDistance || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      journeyStats: { ...formData.journeyStats, totalDistance: e.target.value }
                    })}
                    className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                    placeholder="158.5 km"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Total Driving Time
                  </label>
                  <input
                    type="text"
                    value={formData.journeyStats.totalTime || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      journeyStats: { ...formData.journeyStats, totalTime: e.target.value }
                    })}
                    className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                    placeholder="2h 07m"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Trip Duration
                  </label>
                  <input
                    type="text"
                    value={formData.journeyStats.tripDuration || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      journeyStats: { ...formData.journeyStats, tripDuration: e.target.value }
                    })}
                    className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                    placeholder="2 Days / 1 Night"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Travel Mode
                  </label>
                  <input
                    type="text"
                    value={formData.journeyStats.travelMode || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      journeyStats: { ...formData.journeyStats, travelMode: e.target.value }
                    })}
                    className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                    placeholder="🚗 By Car / Expressway"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Places I Explored & Places Covered (Connected to Sightseeing API) */}
          {formData.blogType !== 'food' && activeBuilderTab === 'places' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Sightseeing Search & Suggestions Box */}
              <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>
                        {formData.blogType === 'top_list'
                          ? 'Sightseeing Places Suggestions ("Places Covered" / Top List)'
                          : 'Sightseeing Places Suggestions ("Places I Explored")'}
                      </span>
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Suggestions load directly from your Sightseeing inventory. Click any suggestion or <strong>+ Add Place</strong> to include it with verified photos, timings, and coordinates.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                      {allSightseeingSuggestions.length} Places in Database
                    </span>
                  </div>
                </div>

                {/* City Quick-Filter Pills */}
                {availableSightseeingCities.length > 1 && (
                  <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    <span className="text-[11px] font-medium text-emerald-800 shrink-0 mr-1">City Filter:</span>
                    {availableSightseeingCities.map(city => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setSelectedSightseeingCityFilter(city)}
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all shrink-0 ${
                          selectedSightseeingCityFilter === city
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {city === 'ALL' ? 'All Cities' : city}
                      </button>
                    ))}
                  </div>
                )}

                {/* Search Input */}
                <div className="relative mt-3">
                  <div className="flex items-center bg-white rounded-xl border border-emerald-300 shadow-2xs overflow-hidden px-3 py-2">
                    <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={sightseeingQuery}
                      onChange={(e) => setSightseeingQuery(e.target.value)}
                      placeholder="Search attraction name, city, or category (e.g. Banke Bihari, Prem Mandir, Rohtang Pass, Fort, Beach)..."
                      className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
                    />
                    {searchingSightseeing && (
                      <span className="text-[10px] text-slate-400 animate-pulse ml-2 shrink-0">Searching...</span>
                    )}
                    {sightseeingQuery && (
                      <button
                        type="button"
                        onClick={() => setSightseeingQuery('')}
                        className="text-slate-400 hover:text-slate-600 ml-2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Suggestions List / Shelf */}
                <div className="mt-3 bg-white rounded-xl border border-emerald-200/80 shadow-xs p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      {sightseeingQuery.trim()
                        ? `Search Results (${sightseeingResults.length})`
                        : `Available Sightseeing Suggestions (${sightseeingResults.length})`}
                    </span>
                    {loadingSightseeingSuggestions && (
                      <span className="text-[10px] text-slate-400 animate-pulse flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                        Syncing...
                      </span>
                    )}
                  </div>

                  {sightseeingResults.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto space-y-1.5 divide-y divide-slate-100 pr-1">
                      {sightseeingResults.map((sight) => {
                        const name = sight.name || sight.sightseeingName || 'Attraction';
                        const currentList = formData.placesCovered?.length > 0 ? formData.placesCovered : (formData.placesExplored || []);
                        const isAlreadyAdded = currentList.some(
                          p => (p.name && p.name.toLowerCase() === name.toLowerCase()) ||
                               (p.sightseeingId && p.sightseeingId === sight.id)
                        );
                        return (
                          <div
                            key={sight.id}
                            onClick={() => !isAlreadyAdded && handleAddSightseeingPlace(sight)}
                            className={`pt-1.5 first:pt-0 pb-1.5 px-2 rounded-lg flex items-center justify-between transition-colors gap-3 ${
                              isAlreadyAdded
                                ? 'bg-slate-50 opacity-70 cursor-default'
                                : 'hover:bg-emerald-50/70 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <SafeImage
                                src={sight.image || sight.photo || 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?q=80&w=100'}
                                alt={name}
                                className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                                placeholderText="No photo"
                              />
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-slate-900 block truncate">{name}</span>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                  <span>{sight.cityName || sight.city || sight.location || 'India'}</span>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-medium">{sight.category || 'Sightseeing'}</span>
                                  {sight.rating && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                        {sight.rating}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={isAlreadyAdded}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isAlreadyAdded) handleAddSightseeingPlace(sight);
                              }}
                              className={`text-[10px] px-3 py-1 rounded-md font-bold shrink-0 transition-all ${
                                isAlreadyAdded
                                  ? 'bg-slate-200 text-slate-500 cursor-default'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95 shadow-2xs'
                              }`}
                            >
                              {isAlreadyAdded ? '✓ Added' : formData.blogType === 'top_list' ? '+ Add to Top List' : '+ Add Place'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-500">
                      {loadingSightseeingSuggestions ? 'Loading sightseeing suggestions...' : `No sightseeing places found for "${sightseeingQuery}".`}
                    </div>
                  )}
                </div>
              </div>

              {/* Added Places List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span>
                        {formData.blogType === 'top_list' ? 'Places Covered in Guide' : 'Places I Explored'} ({(formData.placesCovered?.length || formData.placesExplored?.length || 0)})
                      </span>
                      {formData.blogType === 'top_list' && (
                        <span className="text-[10px] text-[#F97316] font-normal normal-case">
                          (Top List rankings #1 to #N can be re-ordered using arrows)
                        </span>
                      )}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newManual = {
                        id: `plc_${Date.now()}`,
                        name: 'New Attraction',
                        city: formData.destination || 'City',
                        rating: '4.8',
                        timing: '09:00 AM – 05:00 PM',
                        image: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?q=80&w=400',
                        description: 'Description of the place.'
                      };
                      setFormData(prev => {
                        const exp = [...(prev.placesExplored || []), newManual];
                        const cov = [...(prev.placesCovered || []), newManual];
                        return { ...prev, placesExplored: exp, placesCovered: cov };
                      });
                    }}
                    className="text-xs font-bold text-[#F97316] hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Manual Place</span>
                  </button>
                </div>

                {/* Places Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(formData.placesCovered?.length > 0 ? formData.placesCovered : (formData.placesExplored || [])).map((place, pIdx) => (
                    <div
                      key={place.id || pIdx}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5 relative group hover:border-slate-300 transition-all"
                    >
                      {/* Top Action Bar with Rank Badge, Reorder Arrows & Delete */}
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                            #{pIdx + 1}
                          </span>
                          <span className="text-[11px] font-bold text-slate-700 truncate max-w-[140px]">
                            {place.name || 'Attraction'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={pIdx === 0}
                            onClick={() => handleMovePlace(pIdx, -1)}
                            title="Move Up"
                            className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={pIdx === (formData.placesCovered?.length || formData.placesExplored?.length || 1) - 1}
                            onClick={() => handleMovePlace(pIdx, 1)}
                            title="Move Down"
                            className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePlace(pIdx)}
                            title="Delete place"
                            className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Place Name */}
                      <div>
                        <label className="text-[10px] font-medium text-slate-500 block mb-0.5">Attraction Name</label>
                        <input
                          type="text"
                          value={place.name || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => {
                              const list = [...(prev.placesCovered?.length > 0 ? prev.placesCovered : (prev.placesExplored || []))];
                              list[pIdx] = { ...list[pIdx], name: val };
                              return { ...prev, placesCovered: list, placesExplored: list };
                            });
                          }}
                          className="text-xs font-bold text-slate-900 border border-slate-200 rounded-md px-2.5 py-1.5 focus:border-orange-500 focus:outline-hidden w-full"
                          placeholder="Place Name"
                        />
                      </div>

                      {/* City & Timing */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-medium text-slate-500 block mb-0.5">City / Location</label>
                          <input
                            type="text"
                            value={place.city || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData(prev => {
                                const list = [...(prev.placesCovered?.length > 0 ? prev.placesCovered : (prev.placesExplored || []))];
                                list[pIdx] = { ...list[pIdx], city: val };
                                return { ...prev, placesCovered: list, placesExplored: list };
                              });
                            }}
                            placeholder="City / Region"
                            className="text-[11px] px-2 py-1 rounded bg-slate-50 border border-slate-200 w-full"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-slate-500 block mb-0.5">Visiting Hours</label>
                          <input
                            type="text"
                            value={place.timing || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData(prev => {
                                const list = [...(prev.placesCovered?.length > 0 ? prev.placesCovered : (prev.placesExplored || []))];
                                list[pIdx] = { ...list[pIdx], timing: val };
                                return { ...prev, placesCovered: list, placesExplored: list };
                              });
                            }}
                            placeholder="Visiting Hours"
                            className="text-[11px] px-2 py-1 rounded bg-slate-50 border border-slate-200 w-full"
                          />
                        </div>
                      </div>

                      {/* Image URL & Preview */}
                      <div>
                        <label className="text-[10px] font-medium text-slate-500 block mb-0.5">Photo URL</label>
                        <input
                          type="url"
                          value={place.image || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => {
                              const list = [...(prev.placesCovered?.length > 0 ? prev.placesCovered : (prev.placesExplored || []))];
                              list[pIdx] = { ...list[pIdx], image: val };
                              return { ...prev, placesCovered: list, placesExplored: list };
                            });
                          }}
                          placeholder="https://..."
                          className="w-full text-[11px] px-2 py-1 rounded bg-slate-50 border border-slate-200"
                        />
                      </div>

                      {place.image && (
                        <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                          <SafeImage
                            src={place.image}
                            alt={place.name || 'Place photo'}
                            className="w-full h-full object-cover"
                            placeholderText="Place image not available"
                          />
                        </div>
                      )}

                      {/* Description */}
                      <div>
                        <label className="text-[10px] font-medium text-slate-500 block mb-0.5">Description</label>
                        <textarea
                          rows={2}
                          value={place.description || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => {
                              const list = [...(prev.placesCovered?.length > 0 ? prev.placesCovered : (prev.placesExplored || []))];
                              list[pIdx] = { ...list[pIdx], description: val };
                              return { ...prev, placesCovered: list, placesExplored: list };
                            });
                          }}
                          placeholder="Short description..."
                          className="w-full text-[11px] p-2 rounded bg-slate-50 border border-slate-200 leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Type Specific Fields (Top 10 / Food Trail / Destination) */}
          {activeBuilderTab === 'type_specific' && (
            <div className="space-y-6 animate-in fade-in">
              {/* TOP LIST TYPE (Clean Summary & Place Preview) */}
              {formData.blogType === 'top_list' && (
                <div className="bg-orange-50/70 border border-orange-200/90 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#F97316]" />
                        <span>Top List Guide: Places Covered ({(formData.placesCovered?.length || formData.placesExplored?.length || 0)} Places)</span>
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        These places form your ranked Top 10 guide. You can search, add from sightseeing inventory, and re-order them in <strong>Tab 3: Places</strong>.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveBuilderTab('places')}
                      className="px-3.5 py-2 rounded-lg bg-[#F97316] hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Search & Manage Places (Tab 3)</span>
                    </button>
                  </div>

                  {(formData.placesCovered?.length > 0 || formData.placesExplored?.length > 0) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {(formData.placesCovered?.length > 0 ? formData.placesCovered : formData.placesExplored).map((plc, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-orange-200/70 shadow-2xs">
                          <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <SafeImage
                            src={plc.image || 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?q=80&w=100'}
                            alt={plc.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                            placeholderText="No photo"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-slate-900 block truncate">{plc.name}</span>
                            <span className="text-[10px] text-slate-500 block truncate">{plc.city || 'India'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-white/80 rounded-xl border border-orange-200 text-center text-xs text-slate-600">
                      No places added yet. Click above to open Tab 3 and search your Sightseeing database!
                    </div>
                  )}
                </div>
              )}

              {/* FOOD BLOG TYPE */}
              {formData.blogType === 'food' && (
                <div className="space-y-6">
                  {/* Must Try Dishes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-[#F97316]" />
                        <span>Must Try Dishes ({formData.foodDishes.length})</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            foodDishes: [
                              ...prev.foodDishes,
                              {
                                name: 'New Regional Dish',
                                image: 'https://images.unsplash.com/photo-1626100731599-8c5f0f8e8c1a?q=80&w=400',
                                description: 'Authentic local preparation served hot.'
                              }
                            ]
                          }));
                        }}
                        className="text-xs font-bold text-[#F97316] hover:text-orange-700 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Dish</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.foodDishes.map((dish, dIdx) => (
                        <div key={dIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.foodDishes.filter((_, i) => i !== dIdx);
                              setFormData({ ...formData, foodDishes: updated });
                            }}
                            className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="text"
                            value={dish.name}
                            onChange={(e) => {
                              const updated = [...formData.foodDishes];
                              updated[dIdx].name = e.target.value;
                              setFormData({ ...formData, foodDishes: updated });
                            }}
                            placeholder="Dish Name"
                            className="text-xs font-bold bg-white border border-slate-200 rounded px-2 py-1 w-full"
                          />
                          <input
                            type="url"
                            value={dish.image}
                            onChange={(e) => {
                              const updated = [...formData.foodDishes];
                              updated[dIdx].image = e.target.value;
                              setFormData({ ...formData, foodDishes: updated });
                            }}
                            placeholder="Dish Image URL"
                            className="text-[11px] bg-white border border-slate-200 rounded px-2 py-1 w-full"
                          />
                          {dish.image && (
                            <div className="w-full h-20 rounded-lg overflow-hidden bg-white border border-slate-200">
                              <SafeImage
                                src={dish.image}
                                alt={dish.name || 'Dish preview'}
                                className="w-full h-full object-cover"
                                placeholderText="Dish image not available"
                              />
                            </div>
                          )}
                          <textarea
                            rows={2}
                            value={dish.description}
                            onChange={(e) => {
                              const updated = [...formData.foodDishes];
                              updated[dIdx].description = e.target.value;
                              setFormData({ ...formData, foodDishes: updated });
                            }}
                            placeholder="Flavors, ingredients, serving style..."
                            className="text-[11px] bg-white border border-slate-200 rounded p-2 w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best Places to Eat */}
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">
                        Best Places to Eat ({formData.foodPlaces.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            foodPlaces: [
                              ...prev.foodPlaces,
                              {
                                name: 'Legendary Eatery',
                                city: 'Ahmedabad',
                                rating: '4.6',
                                image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=300',
                                description: 'Famous for royal thali and traditional sweets.'
                              }
                            ]
                          }));
                        }}
                        className="text-xs font-bold text-[#F97316] hover:text-orange-700 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Eatery</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.foodPlaces.map((fp, fIdx) => (
                        <div key={fIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.foodPlaces.filter((_, i) => i !== fIdx);
                              setFormData({ ...formData, foodPlaces: updated });
                            }}
                            className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={fp.name}
                              onChange={(e) => {
                                const updated = [...formData.foodPlaces];
                                updated[fIdx].name = e.target.value;
                                setFormData({ ...formData, foodPlaces: updated });
                              }}
                              placeholder="Restaurant Name"
                              className="text-xs font-bold bg-white border border-slate-200 rounded px-2 py-1"
                            />
                            <input
                              type="text"
                              value={fp.city}
                              onChange={(e) => {
                                const updated = [...formData.foodPlaces];
                                updated[fIdx].city = e.target.value;
                                setFormData({ ...formData, foodPlaces: updated });
                              }}
                              placeholder="City"
                              className="text-xs bg-white border border-slate-200 rounded px-2 py-1"
                            />
                          </div>
                          <input
                            type="url"
                            value={fp.image}
                            onChange={(e) => {
                              const updated = [...formData.foodPlaces];
                              updated[fIdx].image = e.target.value;
                              setFormData({ ...formData, foodPlaces: updated });
                            }}
                            placeholder="Image URL"
                            className="text-[11px] bg-white border border-slate-200 rounded px-2 py-1 w-full"
                          />
                          {fp.image && (
                            <div className="w-full h-20 rounded-lg overflow-hidden bg-white border border-slate-200">
                              <SafeImage
                                src={fp.image}
                                alt={fp.name || 'Eatery preview'}
                                className="w-full h-full object-cover"
                                placeholderText="Eatery image not available"
                              />
                            </div>
                          )}
                          <textarea
                            rows={2}
                            value={fp.description}
                            onChange={(e) => {
                              const updated = [...formData.foodPlaces];
                              updated[fIdx].description = e.target.value;
                              setFormData({ ...formData, foodPlaces: updated });
                            }}
                            placeholder="Specialty dishes, atmosphere..."
                            className="text-[11px] bg-white border border-slate-200 rounded p-2 w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* DESTINATION TYPE (My Experience Quote & Photos) */}
              {formData.blogType === 'destination' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Traveler Reflection / Experience Quote
                    </label>
                    <textarea
                      rows={3}
                      value={formData.experience?.quote || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        experience: { ...formData.experience, quote: e.target.value }
                      })}
                      placeholder="Vrindavan is not just a place, it is an emotion that settles deep into your soul..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Experience Photos (Up to 3 URLs)
                    </label>
                    <div className="space-y-2">
                      {[0, 1, 2].map((pIdx) => (
                        <input
                          key={pIdx}
                          type="url"
                          value={(formData.experience?.photos && formData.experience.photos[pIdx]) || ''}
                          onChange={(e) => {
                            const updatedPhotos = [...(formData.experience?.photos || ['', '', ''])];
                            updatedPhotos[pIdx] = e.target.value;
                            setFormData({
                              ...formData,
                              experience: { ...formData.experience, photos: updatedPhotos }
                            });
                          }}
                          placeholder={`Photo URL #${pIdx + 1}`}
                          className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 bg-slate-50"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Snapshot & Travel Tips */}
          {activeBuilderTab === 'tips' && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Trip Snapshot Metrics (Shown in Right Rail)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Trip Days</label>
                    <input
                      type="text"
                      value={formData.tripSnapshot?.days || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        tripSnapshot: { ...formData.tripSnapshot, days: e.target.value }
                      })}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-bold"
                      placeholder="4"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Places Visited</label>
                    <input
                      type="text"
                      value={formData.tripSnapshot?.places || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        tripSnapshot: { ...formData.tripSnapshot, places: e.target.value }
                      })}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-bold"
                      placeholder="9"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Total Distance</label>
                    <input
                      type="text"
                      value={formData.tripSnapshot?.distance || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        tripSnapshot: { ...formData.tripSnapshot, distance: e.target.value }
                      })}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-bold"
                      placeholder="163 km"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Avg Spend</label>
                    <input
                      type="text"
                      value={formData.tripSnapshot?.spend || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        tripSnapshot: { ...formData.tripSnapshot, spend: e.target.value }
                      })}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-bold"
                      placeholder="₹ 3,250"
                    />
                  </div>
                </div>
              </div>

              {/* Travel Tips List */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Travel Advice &amp; Checklist ({formData.tips.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        tips: [...prev.tips, 'New practical tip for travelers.']
                      }));
                    }}
                    className="text-xs font-bold text-[#F97316] hover:text-orange-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Tip</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.tips.map((tip, tIdx) => (
                    <div key={tIdx} className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <input
                        type="text"
                        value={tip}
                        onChange={(e) => {
                          const updated = [...formData.tips];
                          updated[tIdx] = e.target.value;
                          setFormData({ ...formData, tips: updated });
                        }}
                        className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.tips.filter((_, i) => i !== tIdx);
                          setFormData({ ...formData, tips: updated });
                        }}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-5 border-t border-slate-100 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{initialData ? 'Save Changes' : 'Publish Travel Article'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Icon Picker Modal */}
        <IconPickerModal
          isOpen={iconPickerOpen}
          onClose={() => {
            setIconPickerOpen(false);
            setSelectedStepIndex(null);
          }}
          currentIcon={formData.journeyRoute[selectedStepIndex]?.icon || 'MapPin'}
          onSelectIcon={handleSelectIconForStep}
        />
      </div>
    </div>
  );
}
