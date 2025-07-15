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
    },
    power: {
        w_sqm: 1,           // Base unit: W/m²
        w_sqft: 10.764,     // W/ft² to W/m²
        kw_rack: 238.1,     // kW/rack to W/m² (assuming 42U rack ~2m²)
        btu_sqft_hr: 3.155, // BTU/ft²/hr to W/m²
        tons_sqft: 37584,   // Tons/1000ft² to W/m²
        w_sqin: 1550       // W/in² to W/m²
    },
    pressure: {
        pa: 1,              // Base unit: Pascal
        in_wc: 248.84,      // in H₂O to Pa
        mm_wc: 9.807,       // mm H₂O to Pa
        psi: 6894.76,       // PSI to Pa
        bar: 100000,        // Bar to Pa
        kpa: 1000,          // kPa to Pa
        mmhg: 133.322       // mmHg to Pa
    },
    energy: {
        w: 1,               // Base unit: Watts (thermal)
        kw: 1000,           // kW to W
        btu_hr: 0.293071,   // BTU/hr to W
        tons: 3516.85,      // Tons (cooling) to W
        kcal_hr: 1.163,     // kcal/hr to W
        hp: 745.7           // Horsepower to W
    }
};

// Temperature conversion functions
function convertTemperature(value, from, to) {
    // Convert to Celsius first
    let celsius;
    switch (from) {
        case 'c': celsius = value; break;
        case 'f': celsius = (value - 32) * 5 / 9; break;
        case 'k': celsius = value - 273.15; break;
    }

    // Convert from Celsius to target
    switch (to) {
        case 'c': return celsius;
        case 'f': return celsius * 9 / 5 + 32;
        case 'k': return celsius + 273.15;
    }
}

// Humidity conversion functions (simplified - assumes 20°C for RH calculations)
function convertHumidity(value, from, to) {
    // Note: These are approximations. Real psychrometric calculations require temperature input
    let absHumidity; // g/m³

    // Convert to absolute humidity (g/m³) first
    switch (from) {
        case 'rh': absHumidity = value * 0.173; break; // Approx at 20°C
        case 'abs_g_m3': absHumidity = value; break;
        case 'abs_gr_lb': absHumidity = value * 2.288; break; // grains/lb to g/m³
        case 'dewpoint_c': absHumidity = 6.112 * Math.exp((17.67 * value) / (value + 243.5)) * 2.1674 / (273.15 + 20); break;
        case 'dewpoint_f':
            let dewC = (value - 32) * 5 / 9;
            absHumidity = 6.112 * Math.exp((17.67 * dewC) / (dewC + 243.5)) * 2.1674 / (273.15 + 20);
            break;
        case 'mixing_ratio': absHumidity = value * 1.608; break; // Approx conversion
        default: absHumidity = value;
    }

    // Convert from absolute humidity to target
    switch (to) {
        case 'rh': return absHumidity / 0.173; // Approx at 20°C
        case 'abs_g_m3': return absHumidity;
        case 'abs_gr_lb': return absHumidity / 2.288;
        case 'dewpoint_c': return 243.5 * Math.log(absHumidity * (273.15 + 20) / (6.112 * 2.1674)) / (17.67 - Math.log(absHumidity * (273.15 + 20) / (6.112 * 2.1674)));
        case 'dewpoint_f':
            let dewC = 243.5 * Math.log(absHumidity * (273.15 + 20) / (6.112 * 2.1674)) / (17.67 - Math.log(absHumidity * (273.15 + 20) / (6.112 * 2.1674)));
            return dewC * 9 / 5 + 32;
        case 'mixing_ratio': return absHumidity / 1.608;
        default: return absHumidity;
    }
}

// Generic conversion function
function convert(value, from, to, type) {
    if (type === 'temp') {
        return convertTemperature(value, from, to);
    }
    if (type === 'humidity') {
        return convertHumidity(value, from, to);
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
document.addEventListener('DOMContentLoaded', function () {
    setupConverter('length');
    setupConverter('weight');
    setupConverter('temp');
    setupConverter('volume');
    setupConverter('flow');
    setupConverter('power');
    setupConverter('pressure');
    setupConverter('energy');
    setupConverter('humidity');
});