import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api } from "@/services/api";

export const useAppStore = defineStore("app", () => {
  // State
  const materials = ref([]);
  const equipment = ref([]);
  const labor = ref([]);
  const assemblies = ref([]);
  const quotes = ref([]);
  const currentQuote = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const activeTab = ref("line-items"); // 'quotes', 'builder', 'catalog', 'labor', 'line-items', 'settings'

  const settings = ref({
    costTypes: ["None", "Materials", "Labor", "Subcontract", "Equipment", "Other", "Macro"],
    unitTypes: ["cu. yd.", "hours", "each", "s.f.", "l.f.", "cu. ft.", "square"],
    acctCodes: ["4100 - Contract Work - Flat rate", "4150 - Allowance", "4200 - ??"],
    activities: [
      "Supply & Install",
      "Install",
      "Material",
      "Remove",
      "Detach and Reset",
      "Remove and Replace",
      "Supply and Install",
      "Materials",
      "Macro",
    ],
    categories: [
      "Appliances",
      "Cabinets & Countertops",
      "Cornice",
      "Deck Framing",
      "Demo",
      "Doors - Interior",
      "Drywall",
      "Electrical",
      "Excavation",
      "Flooring",
      "Foundation",
      "Framing",
      "General",
      "Hardware",
      "HVAC",
      "Insulation",
      "Masonry",
      "Painting",
      "Plumbing",
      "Roofing",
      "Siding",
      "Stairs",
      "Tile",
      "Trim",
      "Windows & Ext.Doors",
      "Soft Costs",
      "Macro",
      "Steel",
      "Landscaping",
    ],
    trades: [
      "Allowance",
      "Carpet",
      "Concrete",
      "Demo",
      "Drywall",
      "Electrician",
      "Excavator",
      "Framer",
      "Garage Door",
      "Glass",
      "Granite/Quartz",
      "Gutter",
      "Hardwood",
      "HVAC",
      "In-House",
      "Insulation",
      "Landscape",
      "Mason",
      "Painter",
      "Plumber",
      "Railing",
      "Roofer",
      "Security",
      "Siding",
      "Tile",
    ],
    rooms: [
      { category: "Kitchen", code: "Kitchen", description: "Kitchen" },
      { category: "Bathroom", code: "Bathroom", description: "Full Bath" },
      { category: "Bathroom", code: "PR", description: "Powder Room (Half Bath: toilet + sink)" },
      { category: "Bathroom", code: "PBA", description: "Primary Bathroom (Master Bath)" },
      { category: "Bathroom", code: "PTR", description: "Primary Toilet Room (or Pantry / Powder)" },
      { category: "Bathroom", code: "PSWR", description: "Primary Shower" },
      { category: "Bathroom", code: "HBA", description: "Half Bathroom" },
      { category: "Bathroom", code: "BA2", description: "Bathroom 2" },
      { category: "Bathroom", code: "BBA", description: "Basement Bathroom" },
      { category: "Bathroom", code: "ABA", description: "Additional Bathroom" },
      { category: "Bathroom", code: "J&J", description: "Jack and Jill Bathroom (Shared between bedrooms)" },
      { category: "Bedroom", code: "Bedroom", description: "Bedroom (General)" },
      { category: "Bedroom", code: "PBR", description: "Primary Bedroom (Master Bedroom)" },
      { category: "Bedroom", code: "BR2", description: "Bedroom 2" },
      { category: "Bedroom", code: "BR3", description: "Bedroom 3" },
      { category: "Bedroom", code: "BR4", description: "Bedroom 4" },
      { category: "Bedroom", code: "BR5", description: "Bedroom 5" },
      { category: "Bedroom", code: "GBR", description: "Guest Bedroom" },
      { category: "Bedroom", code: "BBR", description: "Basement Bedroom" },
      { category: "Bedroom", code: "ABR", description: "Additional Bedroom" },
      { category: "Closet", code: "Closet", description: "Closet (General Storage)" },
      { category: "Closet", code: "Coat", description: "Coat Closet" },
      { category: "Closet", code: "PCL", description: "Primary Closet (Master Walk-In Closet)" },
      { category: "Closet", code: "HIS", description: "His Closet (Primary Walk-In)" },
      { category: "Closet", code: "HERS", description: "Hers Closet (Primary Walk-In)" },
      { category: "Closet", code: "CL2", description: "Closet 2" },
      { category: "Closet", code: "CL3", description: "Closet 3" },
      { category: "Closet", code: "CL4", description: "Closet 4" },
      { category: "Closet", code: "CL5", description: "Closet 5" },
      { category: "Closet", code: "HCL", description: "Hall Closet" },
      { category: "Closet", code: "Linen", description: "Linen Closet" },
      { category: "Other", code: "Dining", description: "Dining Room" },
      { category: "Other", code: "LR", description: "Living Room" },
      { category: "Other", code: "FR", description: "Family Room" },
      { category: "Other", code: "Foyer", description: "Foyer / Entryway" },
      { category: "Other", code: "Pantry", description: "Food Pantry" },
      { category: "Other", code: "Mudroom", description: "Mudroom" },
      { category: "Other", code: "Laundry", description: "Laundry Room / Utility Room" },
      { category: "Other", code: "Hall", description: "Hallway / Corridor" },
      { category: "Other", code: "UHA", description: "Upper Hallway" },
      { category: "Other", code: "BHA", description: "Basement Hallway" },
      { category: "Other", code: "Stairs Up", description: "Stairs Going Up" },
      { category: "Other", code: "Stairs Dn", description: "Stairs Going Down" },
      { category: "Other", code: "Den", description: "Den / Small Living Room" },
      { category: "Other", code: "Study", description: "Study Room" },
      { category: "Other", code: "Office", description: "Home Office" },
      { category: "Other", code: "Rec", description: "Recreation Room / Playroom" },
      { category: "Other", code: "Sitting", description: "Sitting Room / Lounge" },
      { category: "Other", code: "Sunroom", description: "Sunroom / Solarium" },
      { category: "Other", code: "Exercise", description: "Exercise Room / Home Gym" },
      { category: "Other", code: "Garage", description: "Garage" },
      { category: "Exterior", code: "Exterior", description: "Exterior / Outdoor Area" },
      { category: "Exterior", code: "Deck", description: "Outdoor Deck" },
      { category: "Exterior", code: "Patio", description: "Outdoor Patio" },
      { category: "Exterior", code: "Screened Porch", description: "Screened-In Porch" },
      { category: "Exterior", code: "F. Porch", description: "Front Porch" },
      { category: "Exterior", code: "S. Porch", description: "Side Porch" },
      { category: "Exterior", code: "R. Porch", description: "Rear Porch (Back Porch)" },
    ],
    groups: [
      "Cabinets & Countertops",
      "Electrical",
      "Plumbing",
      "Framing & Drywall",
      "Finish Carpentry",
      "Demo & Cleanup",
      "HVAC & Insulation",
      "General",
    ],
    companyHeader: {
      companyName: "Sycamore Design Build, Inc.",
      address: "4427 Chestnut La. Rockville, MD 20853",
      phone: "(301) 924-9322",
      mhic: "MHIC 68498",
    },
    preparedBy: {
      name: "M. Webb",
      phone: "(301) 252-1355",
    },
    defaults: {
      materialAllowance: 6,
      materialTax: 25,
      equipmentAllowance: 0,
      equipmentTax: 25,
    },
  });

  // Helpers
  const getMaterialById = (id) => materials.value.find((m) => m.id === id);
  const getEquipmentById = (id) => equipment.value.find((e) => e.id === id);
  const getLaborById = (id) => labor.value.find((l) => l.id === id);

  // Computeds
  const quoteTotals = computed(() => {
    if (!currentQuote.value || !currentQuote.value.rooms) {
      return { netCost: 0, clientPrice: 0, allowanceTotal: 0, profitMargin: 0, variance: 0 };
    }

    let netCost = 0;
    let clientPrice = 0;
    let allowanceTotal = 0;

    currentQuote.value.rooms.forEach((room) => {
      room.items.forEach((item) => {
        const itemQty = parseFloat(item.quantity) || 0;

        if (item.type === "assembly") {
          const rollup = calculateAssemblyTotals(item.assemblyData, itemQty);
          netCost += rollup.netCost;
          clientPrice +=
            item.allowanceOverride !== null && item.allowanceOverride !== undefined && item.allowanceOverride !== ""
              ? parseFloat(item.allowanceOverride)
              : rollup.clientPrice;
          allowanceTotal += rollup.allowanceTotal;
        } else {
          const itemNet = parseFloat(item.netCost) || 0;
          const itemTax = parseFloat(item.taxRate) || 0;
          const itemMarkup = parseFloat(item.markup) || 0;
          const unitNet = itemNet;

          const unitGross = unitNet * (1 + itemTax);
          const unitClient = unitGross * (1 + itemMarkup);

          const totalItemNet = unitNet * itemQty;
          const totalItemClient =
            item.allowanceOverride !== null && item.allowanceOverride !== undefined && item.allowanceOverride !== ""
              ? parseFloat(item.allowanceOverride)
              : unitClient * itemQty;

          netCost += totalItemNet;
          clientPrice += totalItemClient;

          if (item.isAllowance) {
            allowanceTotal += totalItemClient;
          }
        }
      });
    });

    const profit = clientPrice - netCost;
    const profitMargin = clientPrice > 0 ? (profit / clientPrice) * 100 : 0;
    const variance = allowanceTotal - clientPrice;

    return {
      netCost: Math.round(netCost * 100) / 100,
      clientPrice: Math.round(clientPrice * 100) / 100,
      allowanceTotal: Math.round(allowanceTotal * 100) / 100,
      profitMargin: Math.round(profitMargin * 10) / 10,
      variance: Math.round(variance * 100) / 100,
    };
  });

  const roomTotals = computed(() => (roomId) => {
    const room = currentQuote.value?.rooms?.find((r) => r.id === roomId);
    if (!room) return { netCost: 0, clientPrice: 0, allowanceTotal: 0 };

    let netCost = 0;
    let clientPrice = 0;
    let allowanceTotal = 0;

    room.items.forEach((item) => {
      const itemQty = parseFloat(item.quantity) || 0;

      if (item.type === "assembly") {
        const rollup = calculateAssemblyTotals(item.assemblyData, itemQty);
        netCost += rollup.netCost;
        clientPrice +=
          item.allowanceOverride !== null && item.allowanceOverride !== undefined && item.allowanceOverride !== ""
            ? parseFloat(item.allowanceOverride)
            : rollup.clientPrice;
        allowanceTotal += rollup.allowanceTotal;
      } else {
        const itemNet = parseFloat(item.netCost) || 0;
        const itemTax = parseFloat(item.taxRate) || 0;
        const itemMarkup = parseFloat(item.markup) || 0;

        const unitGross = itemNet * (1 + itemTax);
        const unitClient = unitGross * (1 + itemMarkup);

        const totalNet = itemNet * itemQty;
        const totalClient =
          item.allowanceOverride !== null && item.allowanceOverride !== undefined && item.allowanceOverride !== ""
            ? parseFloat(item.allowanceOverride)
            : unitClient * itemQty;

        netCost += totalNet;
        clientPrice += totalClient;

        if (item.isAllowance) {
          allowanceTotal += totalClient;
        }
      }
    });

    return {
      netCost: Math.round(netCost * 100) / 100,
      clientPrice: Math.round(clientPrice * 100) / 100,
      allowanceTotal: Math.round(allowanceTotal * 100) / 100,
    };
  });

  // Actions
  const loadCatalog = async () => {
    isLoading.value = true;
    try {
      const data = await api.getCatalog();
      materials.value = data.materials || [];
      equipment.value = data.equipment || [];
      labor.value = data.labor || [];
      assemblies.value = data.assemblies || [];
      if (data.settings) {
        settings.value = {
          costTypes: data.settings.costTypes || settings.value.costTypes,
          unitTypes: data.settings.unitTypes || settings.value.unitTypes,
          acctCodes: data.settings.acctCodes || settings.value.acctCodes,
          activities: data.settings.activities || settings.value.activities,
          categories: data.settings.categories || settings.value.categories,
          trades: data.settings.trades || settings.value.trades,
          rooms: data.settings.rooms || settings.value.rooms,
          defaults: data.settings.defaults
            ? { ...settings.value.defaults, ...data.settings.defaults }
            : settings.value.defaults,
        };
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const saveCatalog = async () => {
    isLoading.value = true;
    try {
      const catalog = {
        materials: materials.value,
        equipment: equipment.value,
        labor: labor.value,
        assemblies: assemblies.value,
        settings: settings.value,
      };
      await api.saveCatalog(catalog);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const loadQuotes = async () => {
    isLoading.value = true;
    try {
      quotes.value = await api.getQuotes();
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const loadQuote = async (id) => {
    isLoading.value = true;
    try {
      currentQuote.value = await api.getQuote(id);
      activeTab.value = "quotes";
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const newQuote = () => {
    currentQuote.value = {
      id: `quote_${Date.now()}`,
      name: "New Estimating Quote",
      clientName: "",
      date: new Date().toISOString().split("T")[0],
      status: "Draft",
      rooms: [
        { id: `room_${Date.now()}_1`, name: "Kitchen", order: 0, items: [] },
        { id: `room_${Date.now()}_2`, name: "Primary Bath", order: 1, items: [] },
      ],
    };
    activeTab.value = "builder";
  };

  const saveCurrentQuote = async () => {
    if (!currentQuote.value) return;
    isLoading.value = true;
    try {
      const totals = quoteTotals.value;
      currentQuote.value.grandTotal = totals.clientPrice;
      await api.saveQuote(currentQuote.value);
      await loadQuotes();
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteQuote = async (id) => {
    isLoading.value = true;
    try {
      await api.deleteQuote(id);
      if (currentQuote.value?.id === id) {
        currentQuote.value = null;
      }
      await loadQuotes();
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const addRoom = (name) => {
    if (!currentQuote.value) return;
    const order = currentQuote.value.rooms.length;
    currentQuote.value.rooms.push({
      id: `room_${Date.now()}`,
      name: name || `Room ${order + 1}`,
      order,
      items: [],
    });
  };

  const removeRoom = (roomId) => {
    if (!currentQuote.value) return;
    currentQuote.value.rooms = currentQuote.value.rooms.filter((r) => r.id !== roomId);
  };

  const renameRoom = (roomId, newName) => {
    if (!currentQuote.value) return;
    const room = currentQuote.value.rooms.find((r) => r.id === roomId);
    if (room) {
      room.name = newName;
    }
  };

  const reorderRoom = (roomId, direction) => {
    if (!currentQuote.value) return;
    const index = currentQuote.value.rooms.findIndex((r) => r.id === roomId);
    if (index === -1) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentQuote.value.rooms.length) return;

    const temp = currentQuote.value.rooms[index];
    currentQuote.value.rooms[index] = currentQuote.value.rooms[targetIndex];
    currentQuote.value.rooms[targetIndex] = temp;

    currentQuote.value.rooms.forEach((r, idx) => {
      r.order = idx;
    });
  };

  const addItemToRoom = (roomId, catalogItem, type) => {
    if (!currentQuote.value) return;
    const room = currentQuote.value.rooms.find((r) => r.id === roomId);
    if (!room) return;

    let quoteItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      catalogId: catalogItem.id,
      type,
      name: catalogItem.name,
      quantity: catalogItem.defaultQty || 1,
      allowanceOverride: null,
    };

    if (type === "assembly") {
      quoteItem.description = catalogItem.desc;
      quoteItem.unit = catalogItem.unitType;

      quoteItem.assemblyData = {
        laborRequirements: (catalogItem.laborRequirements || []).map((req) => {
          const laborRole = getLaborById(req.classificationId);
          return {
            classificationId: req.classificationId,
            name: laborRole?.name || "Unknown Labor",
            rate: laborRole?.rate || 0,
            unitHours: parseFloat(req.unitHours) || 0,
            baseHours: parseFloat(req.baseHours) || 0,
            allowMode: req.allowMode || "None",
          };
        }),
        materialRequirements: (catalogItem.materialRequirements || []).map((req) => {
          const mat = getMaterialById(req.materialId);
          return {
            materialId: req.materialId,
            name: mat?.name || "Unknown Material",
            price: mat?.netPrice || 0,
            tax: mat?.tax !== undefined ? mat.tax : 0.25,
            allowance: mat?.allowance !== undefined ? mat.allowance : 0.06,
            qty: parseFloat(req.qty) || 0,
            base: !!req.base,
          };
        }),
        equipmentRequirements: (catalogItem.equipmentRequirements || []).map((req) => {
          const eq = getEquipmentById(req.equipmentId);
          return {
            equipmentId: req.equipmentId,
            name: eq?.name || "Unknown Equipment",
            price: eq?.netPrice || 0,
            tax: eq?.tax !== undefined ? eq.tax : 0.25,
            allowance: eq?.allowance !== undefined ? eq.allowance : 0,
            qty: parseFloat(req.qty) || 0,
            base: !!req.base,
          };
        }),
      };
    } else {
      quoteItem.unit = catalogItem.unit;
      quoteItem.netCost = catalogItem.netPrice;
      quoteItem.taxRate = catalogItem.tax !== undefined ? catalogItem.tax : 0.25;
      quoteItem.markup = catalogItem.markup !== undefined ? catalogItem.markup : 0.25;
      quoteItem.isAllowance = false;
    }

    room.items.push(quoteItem);
  };

  const removeItemFromRoom = (roomId, itemId) => {
    if (!currentQuote.value) return;
    const room = currentQuote.value.rooms.find((r) => r.id === roomId);
    if (room) {
      room.items = room.items.filter((i) => i.id !== itemId);
    }
  };

  return {
    materials,
    equipment,
    labor,
    assemblies,
    quotes,
    currentQuote,
    isLoading,
    error,
    activeTab,
    settings,
    getMaterialById,
    getEquipmentById,
    getLaborById,
    quoteTotals,
    roomTotals,
    loadCatalog,
    saveCatalog,
    loadQuotes,
    loadQuote,
    newQuote,
    saveCurrentQuote,
    deleteQuote,
    addRoom,
    removeRoom,
    renameRoom,
    reorderRoom,
    addItemToRoom,
    removeItemFromRoom,
  };
});

// Helper calculation to roll up nested assembly costs
export function calculateAssemblyTotals(assemblyData, assemblyQty) {
  let netCost = 0;
  let clientPrice = 0;
  let allowanceTotal = 0;

  if (!assemblyData) return { netCost, clientPrice, allowanceTotal };

  // Labor
  assemblyData.laborRequirements.forEach((req) => {
    const totalHours = req.unitHours * assemblyQty + req.baseHours;
    const cost = totalHours * req.rate;
    netCost += cost;
    clientPrice += cost;

    const mode = req.allowMode || "None";
    if (mode === "Both") {
      allowanceTotal += cost;
    } else if (mode === "Only Unit Hr") {
      allowanceTotal += req.unitHours * assemblyQty * req.rate;
    } else if (mode === "Only Base Hr") {
      allowanceTotal += req.baseHours * req.rate;
    }
  });

  // Materials
  assemblyData.materialRequirements.forEach((req) => {
    const totalQty = req.base ? req.qty : req.qty * assemblyQty;
    const itemNet = req.price * totalQty;
    const itemGross = itemNet * (1 + req.tax);
    const itemClient = itemGross * 1.25;

    netCost += itemNet;
    clientPrice += itemClient;
    const allowPct = req.allowance !== undefined ? req.allowance : 0;
    if (req.allow) allowanceTotal += itemClient * allowPct;
  });

  // Equipment
  assemblyData.equipmentRequirements.forEach((req) => {
    const totalQty = req.base ? req.qty : req.qty * assemblyQty;
    const itemNet = req.price * totalQty;
    const itemGross = itemNet * (1 + req.tax);
    const itemClient = itemGross * 1.25;

    netCost += itemNet;
    clientPrice += itemClient;
    const allowPct = req.allowance !== undefined ? req.allowance : 0;
    if (req.allow) allowanceTotal += itemClient * allowPct;
  });

  return { netCost, clientPrice, allowanceTotal };
}
