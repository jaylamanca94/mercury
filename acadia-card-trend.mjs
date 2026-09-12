// Shared CardTrend geometry for React and generated HTML specimens.
function sparklineBaselineValue(points, baseline) {
    if (typeof baseline === "number" && Number.isFinite(baseline)) {
        return baseline;
    }
    if (baseline === "zero") {
        return 0;
    }
    return points[0] ?? 0;
}
// Shared path for CardTrend and gap-aware HTML charts. Null starts a new run.
// Bounded tangents preserve every observation and cannot overshoot either endpoint.
export function buildCardTrendPath(points, interpolation = "smooth") {
    if (!["linear", "smooth"].includes(interpolation)) return "";
    const runs = [[]];
    for (const point of points) {
        if (point === null) { runs.push([]); continue; }
        const run = runs.at(-1);
        if (!Number.isFinite(point?.x) || !Number.isFinite(point?.y) || (run.length && point.x <= run.at(-1).x)) return "";
        run.push(point);
    }
    return runs.filter(run => run.length).map(run => {
        const commands = [`M ${run[0].x.toFixed(1)} ${run[0].y.toFixed(1)}`];
        const slopes = run.slice(1).map((point, index) => (point.y - run[index].y) / (point.x - run[index].x));
        const tangents = run.map((_, index) => {
            if (!index) return slopes[0] ?? 0;
            if (index === run.length - 1) return slopes.at(-1);
            const before = slopes[index - 1], after = slopes[index];
            return Math.sign(before) === Math.sign(after) ? Math.sign(before) * Math.min(Math.abs(before), Math.abs(after)) : 0;
        });
        for (let index = 0; index < run.length - 1; index++) {
            const start = run[index], end = run[index + 1];
            if (interpolation === "linear") {
                commands.push(`L ${end.x.toFixed(1)} ${end.y.toFixed(1)}`);
                continue;
            }
            const third = (end.x - start.x) / 3;
            commands.push(`C ${(start.x + third).toFixed(1)} ${(start.y + tangents[index] * third).toFixed(1)} ${(end.x - third).toFixed(1)} ${(end.y - tangents[index + 1] * third).toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`);
        }
        return commands.join(" ");
    }).join(" ");
}
function sparklineAreaPath(linePath, points, height) {
    if (!linePath || points.length < 2) {
        return "";
    }
    const start = points[0];
    const end = points[points.length - 1];
    return `${linePath} L ${end.x.toFixed(1)} ${height.toFixed(1)} L ${start.x.toFixed(1)} ${height.toFixed(1)} Z`;
}
/** Gentle curves are the default; both modes preserve every supplied observation. */
export function buildCardTrendGeometry({ points, baseline = "first", domain, interpolation = "smooth", width = 180, height = 42 }) {
    const values = Array.from(points || []);
    if (!values.length || !values.every(Number.isFinite) || !Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 8) return null;
    if (!["linear", "smooth"].includes(interpolation)) return null;
    if (domain !== undefined && (domain.length !== 2 || !domain.every(Number.isFinite) || domain[0] >= domain[1] || values.some(value => value < domain[0] || value > domain[1]))) return null;
    const chartPoints = values;
    const baselineValue = sparklineBaselineValue(chartPoints, baseline);
    let min = domain ? domain[0] : chartPoints.reduce((value, point) => Math.min(value, point), baselineValue);
    let max = domain ? domain[1] : chartPoints.reduce((value, point) => Math.max(value, point), baselineValue);
    if (min === max) { min -= 1; max += 1; }
    const yForValue = value => height - ((value - min) / (max - min)) * (height - 8) - 4;
    const coordinates = chartPoints.map((point, index) => ({ x: chartPoints.length > 1 ? index * width / (chartPoints.length - 1) : width / 2, y: yForValue(point) }));
    const linePath = buildCardTrendPath(coordinates, interpolation);
    return {
        points: coordinates,
        baselineY: baselineValue >= min && baselineValue <= max ? yForValue(baselineValue) : null,
        linePath,
        areaPath: sparklineAreaPath(linePath, coordinates, domain ? yForValue(min) : height),
    };
}
