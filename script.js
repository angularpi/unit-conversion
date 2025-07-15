// Conversion factors to base units
const conversions = {
    length: {
        m: 1,
        ft: 0.3048,
        in: 0.0254,
        cm: 0.01,
        km: 1000,
        mi: 1609.344
    },
    weight: {
        kg: 1,
        lb: 0.453592,
        oz: 0.0283495,
        g: 0.001
    },
    volume: {
        l: 1,
        gal: 3.78541,
        ml: 0.001,
        cup: 0.236588,
        fl_oz: 0.0295735
    },
    flow: {
        l_min: 1,           // Base unit: L/min
        cfm: 28.3168,       // CFM to L/min
        l_s: 60,            // L/s to L/min
        m3_h: 16.6667,      // m³/h to L/min
        gpm: 3.78541,       // GPM to L/min
        cfs: 1699.01,       // CFS to L/min
        ml_min: 0.001       // mL/min to L/min
    }
};

// Temperature conversion functions
function convertTemperature(value, from, to) {
    // Convert to Celsius first
    let celsius;
    switch(from) {
        case 'c': celsius = value; break;
        case 'f': celsius = (value - 32) * 5/9; break;
        case 'k': celsius = value - 273.15; break;
    }
    
    // Convert from Celsius to target
    switch(to) {
        case 'c': return celsius;
        case 'f': return celsius * 9/5 + 32;
        case 'k': return celsius + 273.15;
    }
}

// Generic conversion function
function convert(value, from, to, type) {
    if (type === 'temp') {
        return convertTemperature(value, from, to);
    }
    
    const factors = conversions[type];
    if (!factors) return 0;
    
    // Convert to base unit, then to target unit
    const baseValue = value * factors[from];
    return baseValue / factors[to];
}

// Setup converter for a specific type
function setupConverter(type) {
    const input = document.getElementById(`${type}-input`);
    const output = document.getElementById(`${type}-output`);
    const fromSelect = document.getElementById(`${type}-from`);
    const toSelect = document.getElementById(`${type}-to`);
    
    function updateConversion() {
        const value = parseFloat(input.value);
        if (isNaN(value) || value === '') {
            output.value = '';
            return;
        }
        
        const from = fromSelect.value;
        const to = toSelect.value;
        const convertedValue = convert(value, from, to, type);
        
        // Round to 6 decimal places and remove trailing zeros
        output.value = parseFloat(convertedValue.toFixed(6));
    }
    
    input.addEventListener('input', updateConversion);
    fromSelect.addEventListener('change', updateConversion);
    toSelect.addEventListener('change', updateConversion);
}

// Initialize all converters
document.addEventListener('DOMContentLoaded', function() {
    setupConverter('length');
    setupConverter('weight');
    setupConverter('temp');
    setupConverter('volume');
    setupConverter('flow');
});