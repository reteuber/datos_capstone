const dataUrl = "https://raw.githubusercontent.com/reteuber/visualizaciones_capstone/refs/heads/main/tiempo_de_espera.json";

let datos = [];
let turnoSeleccionado = "Todos";
let maxTiempoGlobal = 0;

async function cargarDatos() {
    try {
        const response = await fetch(dataUrl);
        if (!response.ok) throw new Error("No se pudo cargar el archivo JSON.");
        
        const rawData = await response.json();
        
        datos = rawData.map(d => {
            const [horas, minutos] = d.tiempo.split(":").map(Number);
            const tiempoEnMinutos = horas * 60 + minutos;
            return { ...d, tiempo: tiempoEnMinutos };
        });

        maxTiempoGlobal = d3.max(datos, d => d.tiempo);
        
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
            const promedioTiempo = datosTipo.reduce((acc, curr) => acc + curr.tiempo, 0) / datosTipo.length;
            return { tipo_de_caja: tipo, tiempo: promedioTiempo };
        });
    } else {
        datosFiltrados = datos.filter(d => d.turno === turnoSeleccionado);
    }
    
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
        .attr("transform", `translate(${margin.left-15}, ${margin.top-30})`);

    const x = d3.scaleLinear()
        .domain([0, maxTiempoGlobal || 0])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(datosFiltrados.map(d => d.tipo_de_caja))
        .range([0, height])
        .padding(0.2);

        const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x)
            .ticks(20) 
            .tickFormat(d => `${Math.floor(d / 60)}:${d % 60 < 10 ? '0' : ''}${d % 60}`)
            .tickSize(0)) 
        .attr("font-size", "14px");
    
    xAxis.selectAll(".tick line").remove();
    xAxis.select(".tick:first-of-type").remove();
    xAxis.select(".tick:last-of-type").remove();
    xAxis.selectAll("text")
    .attr("transform", "rotate(-45)") 
    .style("text-anchor", "end")       
    .attr("dx", "-0.5em")             
    .attr("dy", "0.15em");             
    

    svg.append("g")
        .call(d3.axisLeft(y).tickSize(0))
        .attr("font-size", "14px")
        .selectAll("text")  
        .attr("transform", "rotate(-90)")  
        .attr("y", -15)  
        .attr("x", 25)  
        .style("text-anchor", "end");

    svg.append("text")
        .attr("x", -margin.left / 2 - 30)
        .attr("y", -50)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .text("Tipo de caja");

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
        .attr("width", d => x(d.tiempo))
        .attr("height", y.bandwidth())
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("fill", d => colorScale(d.tipo_de_caja))
        .on("mouseover", function(event, d) {
            d3.select(this)
                .attr("fill", d3.color(colorScale(d.tipo_de_caja)).darker(1));
        
            const minutos = Math.floor(d.tiempo / 60);
            const segundos = d.tiempo % 60;
        
            svg.append("text")
                .attr("class", "tooltip")
                .attr("x", x(d.tiempo) + 10)
                .attr("y", y(d.tipo_de_caja) + y.bandwidth() / 2 + 5)
                .attr("text-anchor", "start")
                .attr("font-size", "14px")
                .attr("fill", "#33415c")
                .style("font-weight", "bold")
                .text(`${minutos}:${segundos < 10 ? '0' : ''}${segundos}`);
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .attr("fill", colorScale(d.tipo_de_caja));
            svg.select(".tooltip").remove();
        });
        
    
}

function actualizarTurno(turno) {
    if (turnoSeleccionado === turno) {
        turnoSeleccionado = "Todos";
    } else {
        turnoSeleccionado = turno;
    }

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
