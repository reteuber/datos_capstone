const familiaDataURL = "https://raw.githubusercontent.com/reteuber/visualizaciones_capstone/refs/heads/main/familia_cantidad.json";

const width = 600;
const height = 300;
const margin = { top: 20, right: 30, bottom: 100, left: 50 }; // Aumenta el margen inferior para las etiquetas

document.addEventListener("DOMContentLoaded", function () {
    const svg = d3
        .select("#vis-5")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left + 130},${margin.top})`);

    d3.json(familiaDataURL)
        .then((data) => {
            const maxCantidad = d3.max(data, d => d.Cantidad);
            const x = d3.scaleBand()
                .domain(data.map(d => d.Familia))
                .range([0, width])
                .padding(0.2);

            const y = d3.scaleLinear()
                .domain([0, maxCantidad])
                .range([height, 0]);

            svg.append("g")
                .call(d3.axisLeft(y).ticks(5).tickSize(0))
                .selectAll("text")
                .style("font-size", "14px");

            svg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(x).tickSize(0)) // Sin ticks
                .selectAll("text")
                .attr("transform", "rotate(-90)") // Rotación de -90 grados
                .style("text-anchor", "end")
                .attr("dx", "-4em")
                .attr("dy", "0em")
                .style("font-size", "15px");

            svg.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.Familia))
                .attr("y", d => y(d.Cantidad))
                .attr("width", x.bandwidth())
                .attr("height", d => height - y(d.Cantidad))
                .attr("fill", "#e87a59")
                .attr("rx", 6)
                .attr("ry", 6);

            svg.selectAll(".bar-label")
                .data(data)
                .enter()
                .append("text")
                .attr("class", "bar-label")
                .attr("x", d => x(d.Familia) + x.bandwidth() / 2)
                .attr("y", d => y(d.Cantidad) - 5)
                .attr("text-anchor", "middle")
                .text(d => d.Cantidad) 
                .style("fill", "#333")
                .style("font-size", "12px");

            svg.selectAll(".icon")
                .data(data)
                .enter()
                .append("image")
                .attr("xlink:href", d => `assets/${d.Familia.toLowerCase().replace(/ /g, "_")}.svg`)
                .attr("width", 40)
                .attr("height", 40)
                .attr("x", d => x(d.Familia) + x.bandwidth() / 2 - 20)
                .attr("y", height + 10);
        })
        .catch((error) => console.error("Error al cargar los datos:", error));
});
