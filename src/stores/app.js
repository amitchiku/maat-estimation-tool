import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api } from "@/services/api";

export const useAppStore = defineStore("app", () => {
  // State
  const materials = ref([]);
  const equipments = ref([]);
  const labors = ref([]);
  const lineItems = ref([]);
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
      materialTax: 6,
      materialMarkup: 25,
      equipmentTax: 0,
      equipmentMarkup: 25,
    },
  });

  // Helpers
  const getMaterialById = (id) => materials.value.find((m) => m.id === id);
  const getEquipmentById = (id) => equipments.value.find((e) => e.id === id);
  const getLaborById = (id) => labors.value.find((l) => l.id === id);

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

        if (item.type === "lineItems") {
          const rollup = calculatelineItemsTotals(item.lineItemsData, itemQty);
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

          const unitAllowance = unitNet * (1 + itemTax);
          const unitClient = unitAllowance * (1 + itemMarkup);

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

      if (item.type === "lineItems") {
        const rollup = calculatelineItemsTotals(item.lineItemsData, itemQty);
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

        const unitAllowance = itemNet * (1 + itemTax);
        const unitClient = unitAllowance * (1 + itemMarkup);

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
  const getCatalog = async (type) => {
    try {
      isLoading.value = true;
      const data = await api.getCatalog(type);
      console.log(data);
      if (!type) {
        materials.value = data.materials || [];
        equipments.value = data.equipments || [];
        labors.value = data.labors || [];
        lineItems.value = data.lineItems;
        return data;
      }
      if (type === "material") materials.value = data || [];
      else if (type === "labor") labors.value = data || [];
      else if (type === "equipment") equipments.value = data || [];
      else if (type === "lineItem") lineItems.value = data || [];
      return data;
    } catch (err) {
      error.value = `Failed to load catalog ${type || ""}: ${err.message}`;
    } finally {
      isLoading.value = false;
    }
  };

  const loadCatalog = async () => getCatalog();

  const upsertCatalog = async (type, data) => {
    try {
      isLoading.value = true;
      await api.upsertCatalog(type, data);
      if (!type) {
        if (data.materials) materials.value = data.materials;
        if (data.equipments) equipments.value = data.equipments;
        if (data.labors) labors.value = data.labors;
        if (data.lineItems) lineItems.value = data.lineItems;
      } else if (type === "material") {
        materials.value = data;
      } else if (type === "labor") {
        labors.value = data;
      } else if (type === "equipment") {
        equipments.value = data;
      } else if (type === "lineItem") {
        lineItems.value = data;
      }
    } catch (err) {
      error.value = `Failed to save catalog ${type || ""}: ${err.message}`;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const saveCatalog = async () => {
    return upsertCatalog(null, {
      materials: materials.value,
      equipments: equipments.value,
      labors: labors.value,
      lineItems: lineItems.value,
    });
  };

  const loadQuotes = async () => {
    try {
      isLoading.value = true;
      const data = await api.getQuotes();
      quotes.value = data || [];
    } catch (err) {
      error.value = `Failed to load quotes: ${err.message}`;
    } finally {
      isLoading.value = false;
    }
  };

  const loadQuote = async (id) => {
    try {
      isLoading.value = true;
      const data = await api.getQuote(id);
      currentQuote.value = data;
      activeTab.value = "builder";
    } catch (err) {
      error.value = `Failed to load quote: ${err.message}`;
    } finally {
      isLoading.value = false;
    }
  };

  const newQuote = (name = "New Estimate") => {
    const q = {
      id: `quote_${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Draft",
      rooms: [
        {
          id: `room_${Date.now()}_1`,
          name: "General",
          order: 1,
          items: [],
        },
      ],
    };
    quotes.value.push(q);
    currentQuote.value = q;
    activeTab.value = "builder";
  };

  const saveCurrentQuote = async () => {
    if (!currentQuote.value) return;
    try {
      isLoading.value = true;
      currentQuote.value.updatedAt = new Date().toISOString();
      await api.saveQuote(currentQuote.value);
      const idx = quotes.value.findIndex((q) => q.id === currentQuote.value.id);
      if (idx !== -1) {
        quotes.value[idx] = { ...currentQuote.value };
      }
    } catch (err) {
      error.value = `Failed to save quote: ${err.message}`;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteQuote = async (id) => {
    try {
      isLoading.value = true;
      await api.deleteQuote(id);
      quotes.value = quotes.value.filter((q) => q.id !== id);
      if (currentQuote.value?.id === id) {
        currentQuote.value = null;
        activeTab.value = "quotes";
      }
    } catch (err) {
      error.value = `Failed to delete quote: ${err.message}`;
    } finally {
      isLoading.value = false;
    }
  };

  const addRoom = (name) => {
    if (!currentQuote.value) return;
    const newR = {
      id: `room_${Date.now()}`,
      name,
      order: currentQuote.value.rooms.length + 1,
      items: [],
    };
    currentQuote.value.rooms.push(newR);
  };

  const removeRoom = (roomId) => {
    if (!currentQuote.value) return;
    currentQuote.value.rooms = currentQuote.value.rooms.filter((r) => r.id !== roomId);
  };

  const renameRoom = (roomId, newName) => {
    if (!currentQuote.value) return;
    const r = currentQuote.value.rooms.find((rm) => rm.id === roomId);
    if (r) r.name = newName;
  };

  const reorderRoom = (roomId, direction) => {
    if (!currentQuote.value) return;
    const rooms = currentQuote.value.rooms;
    const idx = rooms.findIndex((r) => r.id === roomId);
    if (idx === -1) return;

    if (direction === "up" && idx > 0) {
      const temp = rooms[idx].order;
      rooms[idx].order = rooms[idx - 1].order;
      rooms[idx - 1].order = temp;
    } else if (direction === "down" && idx < rooms.length - 1) {
      const temp = rooms[idx].order;
      rooms[idx].order = rooms[idx + 1].order;
      rooms[idx + 1].order = temp;
    }
  };

  const addItemToRoom = (roomId, catalogItem, islineItems = false) => {
    if (!currentQuote.value) return;
    const room = currentQuote.value.rooms.find((r) => r.id === roomId);
    if (!room) return;

    const quoteItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: catalogItem.name,
      category: catalogItem.category,
      type: islineItems ? "lineItems" : catalogItem.type || "material",
      quantity: 1,
      allowanceOverride: null,
    };

    if (islineItems) {
      quoteItem.unit = catalogItem.unitType || "each";
      quoteItem.lineItemsData = {
        laborRequired: (catalogItem.laborRequired || []).map((req) => {
          const role = labor.value.find((l) => l.id === req.classId) || {};
          return {
            classId: req.classId,
            name: role.name || "Labor Role",
            rate: role.rate || 0,
            unitHours: parseFloat(req.unitHours) || 0,
            baseHours: parseFloat(req.baseHours) || 0,
            allowMode: req.allowMode || "NONE",
          };
        }),
        materialRequired: (catalogItem.materialRequired || []).map((req) => {
          const mat = materials.value.find((m) => m.id === req.materialId) || {};
          return {
            materialId: req.materialId,
            name: mat.name || "Material Item",
            price: mat.netPrice || 0,
            tax: mat.taxPercent !== undefined ? mat.taxPercent / 100 : 0.06,
            markup: mat.markupPercent !== undefined ? mat.markupPercent / 100 : 0.25,
            qty: parseFloat(req.qty) || 0,
            base: !!req.base,
            allow: !!req.allow,
          };
        }),
        equipmentRequired: (catalogItem.equipmentRequired || []).map((req) => {
          const eq = equipments.value.find((e) => e.id === req.equipmentId) || {};
          return {
            equipmentId: req.equipmentId,
            name: eq.name || "Equipment Item",
            price: eq.netPrice || 0,
            tax: eq.taxPercent !== undefined ? eq.taxPercent / 100 : 0,
            markup: eq.markupPercent !== undefined ? eq.markupPercent / 100 : 0.25,
            qty: parseFloat(req.qty) || 0,
            base: !!req.base,
            allow: !!req.allow,
          };
        }),
      };
    } else {
      quoteItem.unit = catalogItem.unit;
      quoteItem.netCost = catalogItem.netPrice;
      quoteItem.taxRate = catalogItem.taxPercent !== undefined ? catalogItem.taxPercent / 100 : 0.06;
      quoteItem.markup = catalogItem.markupPercent !== undefined ? catalogItem.markupPercent / 100 : 0.25;
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
    equipments,
    labors,
    lineItems,
    lineItems: computed(() => lineItems.value),
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
    getCatalog,
    loadCatalog,
    upsertCatalog,
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

// Helper calculation to roll up nested lineItems costs
export function calculatelineItemsTotals(lineItemsData, lineItemsQty) {
  let netCost = 0;
  let clientPrice = 0;
  let allowanceTotal = 0;

  if (!lineItemsData) return { netCost, clientPrice, allowanceTotal };

  // Labor
  (lineItemsData.laborRequired || []).forEach((req) => {
    const totalHours = req.unitHours * lineItemsQty + req.baseHours;
    const cost = totalHours * req.rate;
    netCost += cost;
    clientPrice += cost;

    const mode = String(req.allowMode || "NONE").toUpperCase();
    if (mode === "BOTH") {
      allowanceTotal += cost;
    } else if (mode === "UNIT" || mode === "ONLY UNIT HR") {
      allowanceTotal += req.unitHours * lineItemsQty * req.rate;
    } else if (mode === "BASE" || mode === "ONLY BASE HR") {
      allowanceTotal += req.baseHours * req.rate;
    }
  });

  // Materials: Tax defaults to 6%, Markup defaults to 25%
  // Allowance Price = Price + Tax = Price * (1 + Tax)
  // Gross Price = Price + Tax + Markup = Price * (1 + Tax) * (1 + Markup)
  (lineItemsData.materialRequired || []).forEach((req) => {
    const totalQty = req.base ? req.qty : req.qty * lineItemsQty;
    const itemNet = req.price * totalQty;
    const itemTax = req.tax !== undefined ? req.tax : 0.06;
    const itemMarkup = req.markup !== undefined ? req.markup : 0.25;

    const itemAllowance = itemNet * (1 + itemTax);
    const itemGross = itemAllowance * (1 + itemMarkup);

    netCost += itemNet;
    clientPrice += itemGross;
    if (req.allow) allowanceTotal += itemAllowance;
  });

  // Equipment: Tax defaults to 0%, Markup defaults to 25%
  // Allowance Price = Price + Tax = Price * (1 + Tax)
  // Gross Price = Price + Tax + Markup = Price * (1 + Tax) * (1 + Markup)
  (lineItemsData.equipmentRequired || []).forEach((req) => {
    const totalQty = req.base ? req.qty : req.qty * lineItemsQty;
    const itemNet = req.price * totalQty;
    const itemTax = req.tax !== undefined ? req.tax : 0.0;
    const itemMarkup = req.markup !== undefined ? req.markup : 0.25;

    const itemAllowance = itemNet * (1 + itemTax);
    const itemGross = itemAllowance * (1 + itemMarkup);

    netCost += itemNet;
    clientPrice += itemGross;
    if (req.allow) allowanceTotal += itemAllowance;
  });

  return { netCost, clientPrice, allowanceTotal };
}
