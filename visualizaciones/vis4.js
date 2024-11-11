const dataUrl = "https://raw.githubusercontent.com/reteuber/visualizaciones_capstone/refs/heads/main/personasenfila.json";

let datos = [];
let turnoSeleccionado = "Todos";
let maxPersonasGlobal = 0;

async function cargarDatos() {
    try {
        const response = await fetch(dataUrl);
        if (!response.ok) throw new Error("No se pudo cargar el archivo JSON.");
        
        const rawData = await response.json();
        
        datos = rawData.map(d => ({
            ...d,
            personas: +d.personas_promedio  // Convertir "personas_promedio" a número
        }));

        maxPersonasGlobal = d3.max(datos, d => d.personas) || 0;
        console.log("Datos cargados:", datos);
        console.log("Máximo de personas:", maxPersonasGlobal);
        
        filtrarDatos();
    } catch (error) {
        console.error("Error al cargar los datos:", error);
    }
}

function filtrarDatos() {
    let datosFiltrados;
    
    if (turnoSeleccionado === "Todos") {
        const tipos = ["Asistida", "Autoservicio"];
        datosFiltrados = tipos.map(tipo => {
            const datosTipo = datos.filter(d => d.tipo_de_caja === tipo);
            const promedioPersonas = datosTipo.reduce((acc, curr) => acc + curr.personas, 0) / datosTipo.length;
            return { tipo_de_caja: tipo, personas: promedioPersonas };
        });
    } else {
        datosFiltrados = datos.filter(d => d.turno === turnoSeleccionado);
    }
    
    console.log("Datos filtrados:", datosFiltrados);
    generarGrafico(datosFiltrados);
}

function generarGrafico(datosFiltrados) {
    d3.select("#grafico").html("");

    const margin = { top: 60, right: 30, bottom: 80, left: 120 };
    const width = 600 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svg = d3.select("#grafico")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleLinear()
        .domain([0, maxPersonasGlobal])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(datosFiltrados.map(d => d.tipo_de_caja))
        .range([0, height])
        .padding(0.2);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(10).tickSize(0))
        .attr("font-size", "14px")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "0em")
        .attr("dy", "1em");

    svg.append("g")
        .call(d3.axisLeft(y).tickSize(0))
        .attr("font-size", "14px");

    const colorScale = d3.scaleOrdinal()
        .domain(["Asistida", "Autoservicio"])
        .range(["#8ec0c2", "#f3af4b"]);

    svg.selectAll(".bar")
        .data(datosFiltrados)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => y(d.tipo_de_caja))
        .attr("width", d => x(d.personas))
        .attr("height", y.bandwidth())
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("fill", d => colorScale(d.tipo_de_caja))
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", d3.color(colorScale(d.tipo_de_caja)).darker(1));
        
            // Muestra solo el valor de personas
            svg.append("text")
                .attr("class", "tooltip")
                .attr("x", x(d.personas) + 10)
                .attr("y", y(d.tipo_de_caja) + y.bandwidth() / 2 + 5)
                .attr("text-anchor", "start")
                .attr("font-size", "14px")
                .attr("fill", "#33415c")
                .style("font-weight", "bold")
                .text(d.personas.toFixed(1));  // Muestra el valor con un decimal si es necesario
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("fill", colorScale(d.tipo_de_caja));
            svg.select(".tooltip").remove();  // Elimina el tooltip al salir del hover
        });
        
}

function actualizarTurno(turno) {
    turnoSeleccionado = turno === turnoSeleccionado ? "Todos" : turno;

    document.querySelectorAll(".filtro-btn").forEach(btn => {
        btn.classList.remove("bg-blue-500", "text-white");
        btn.classList.add("bg-gray-200", "text-gray-700");
    });

    document.querySelector(`.filtro-btn[data-turno="${turnoSeleccionado}"]`)
        .classList.remove("bg-gray-200", "text-gray-700");
    document.querySelector(`.filtro-btn[data-turno="${turnoSeleccionado}"]`)
        .classList.add("bg-blue-500", "text-white");

    filtrarDatos();
}

cargarDatos();
document.addEventListener("DOMContentLoaded", () => {
    actualizarTurno("Todos");
});
