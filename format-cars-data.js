const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('public/Самые продаваемые автомобили в мире/data/best_selling_cars_100.json', 'utf-8'));

// Take top 60 (or all) entries
const entries = rawData.slice(0, 60).map(item => {
    // Generate an ID
    const model_id = item.model.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    
    // Parse the sales value to millions for the subtitle
    const salesInMillions = (item.sales / 1000000).toFixed(1).replace('.0', '');
    
    // The image file string (e.g. "images/cutout_1600x900/001-toyota-corolla.png")
    // Should be just "001-toyota-corolla.png" since our component expects it to be in the images folder
    const image_file = item.image_cutout_canvas.split('/').pop();

    return {
        rank: item.rank,
        model_id,
        display_name: item.model,
        sales_value: item.sales,
        types: [item.country],
        image_file,
        video_label: `#${item.rank} ${item.model}`,
        video_subtitle: `${salesInMillions} млн | ${item.country}`
    };
});

const output = {
    generated_at: new Date().toISOString(),
    project_slug: "2026-05-14-best-selling-cars",
    display_metric: "Sales",
    language: "ru",
    methodology: {
        mode: "creative-ranking",
        fact_check_status: "creative",
        scope: "Top 60 Best Selling Cars",
        ranking_basis: "Lifetime Sales",
        sort_direction: "Highest to lowest (ranks 1-60)."
    },
    total_entries: entries.length,
    entries
};

fs.writeFileSync('public/ranking-corridor/2026-05-14-best-selling-cars/data.json', JSON.stringify(output, null, 2));
console.log('Successfully formatted cars data.');
