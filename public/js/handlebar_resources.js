const templateSource = document.getElementById("hero-template").innerHTML;
const template = Handlebars.compile(templateSource);
const context = {
  hero_title_1: "Empowering",
  hero_title_2: "Your",
  hero_title_3: "Ideas",
  hero_title_4: "with",
  hero_title_5: "Us",
  hero_title_6: "Transforming",
  hero_title_7: "your",
  hero_title_8: "concepts",
  hero_title_9: "into",
  hero_title_10: "reality",
  hero_title_11: "Bumble Bees IT Solutions",
  hero_paragraph_1: "is your dedicated partner",
  hero_paragraph_2: "for innovative and tailored IT solutions.",
  btn_text: "Get Started"
};

const html = template(context);
document.getElementById("hero-container").innerHTML = html;
