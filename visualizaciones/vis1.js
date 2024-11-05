const personasDataURL =
  "https://raw.githubusercontent.com/reteuber/visualizaciones_capstone/refs/heads/main/personas.json";

const width = 800;
const height = 400;
const margin = { top: 40, right: 30, bottom: 60, left: 80 };

document.addEventListener("DOMContentLoaded", function () {
  const svg = d3
    .select("#vis-1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("padding", "12px")
    .style("background", "rgba(255, 255, 255, 0.9)")
    .style("border", "1px solid #ccc")
    .style("color", "#333")
    .style("border-radius", "4px")
    .style("font-size", "14px")
    .style("pointer-events", "none")
    .style("box-shadow", "0px 4px 8px rgba(0, 0, 0, 0.1)")
    .style("visibility", "hidden");

  d3.json(personasDataURL)
    .then((data) => {
      const x = d3
        .scalePoint()
        .domain(data.map((d) => d.Hora))
        .range([0, width])
        .padding(0.5);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d["Cantidad de personas"])])
        .nice()
        .range([height, 0]);

      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "14px");

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height + 60)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Hora del día");

      svg
        .append("g")
        .call(d3.axisLeft(y).tickSize(0))
        .selectAll("text")
        .style("font-size", "14px");

      svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .style("font-size", "14px")
        .text("Cantidad de personas en el local");

      svg
        .append("g")
        .attr("class", "grid")
        .selectAll("line")
        .data(y.ticks())
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", (d) => y(d))
        .attr("y2", (d) => y(d))
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", 1);

      svg
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.Hora))
        .attr("cy", (d) => y(d["Cantidad de personas"]))
        .attr("r", 6)
        .attr("fill", "#8297FF")
        .attr("opacity", 0.7)
        .on("mouseover", (event, d) => {
          tooltip
            .style("visibility", "visible")
            .text(`Cantidad de personas a las ${d.Hora}: ${d["Cantidad de personas"]}`);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", `${event.pageY - 20}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });
    })
    .catch((error) => console.error("Error al cargar los datos:", error));
});
