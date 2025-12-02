import { useLanguage } from '@/contexts/LanguageContext';
import { Palette, FileText, Image, Layout, PenTool, FileSpreadsheet, BookOpen, AlertCircle, Zap, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';

type PublicStats = {
  totalProjects: number;
};

const graphicIcons = [
  { icon: Image, label: 'Flyer' },
  { icon: Layout, label: 'Poster' },
  { icon: PenTool, label: 'Social Media' },
  { icon: Palette, label: 'UI/UX' },
];

const academicIcons = [
  { icon: BookOpen, label: 'Essay' },
  { icon: FileSpreadsheet, label: 'PPT' },
  { icon: FileText, label: 'Resume' },
];

export function Services() {
  const { t } = useLanguage();
  
  const { data: stats } = useQuery<PublicStats>({
    queryKey: ['/api/stats'],
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="services" className="py-20 md:py-28 bg-background relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            <span className="gradient-text">{t.services.sectionTitle}</span>
          </h2>
          <p className="font-sans text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.services.sectionSubtitle}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <motion.div variants={itemVariants}>
            <Card className="h-full bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-xl overflow-hidden group hover:border-primary/30 transition-colors duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-8 md:p-10 relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl flex items-center justify-center">
                    <Palette className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    {t.services.graphicDesign.title}
                  </h3>
                </div>

                <p className="font-sans text-muted-foreground mb-6 text-lg">
                  {t.services.graphicDesign.description}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {t.services.graphicDesign.items.map((item, index) => {
                    const IconComponent = graphicIcons[index]?.icon || Image;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 bg-muted/30 border border-border/50 rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <IconComponent className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="font-sans font-medium text-sm text-foreground">{item}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="h-full bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-xl overflow-hidden group hover:border-accent/30 transition-colors duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-8 md:p-10 relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    {t.services.academicHelp.title}
                  </h3>
                </div>

                <p className="font-sans text-muted-foreground mb-6 text-lg">
                  {t.services.academicHelp.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {t.services.academicHelp.items.map((item, index) => {
                    const IconComponent = academicIcons[index]?.icon || FileText;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 bg-muted/30 border border-border/50 rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <IconComponent className="w-5 h-5 text-accent flex-shrink-0" />
                        <span className="font-sans font-medium text-sm text-foreground">{item}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/20 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="font-sans text-sm text-accent-foreground/80">
                    {t.services.academicHelp.note}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-xl text-center p-8 hover:border-primary/30 transition-colors duration-300">
              <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl flex items-center justify-center">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <div className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2" data-testid="text-project-count">
                {stats?.totalProjects || 0}
              </div>
              <div className="font-sans font-medium text-muted-foreground uppercase tracking-wide text-sm">
                Proyek Selesai
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-xl text-center p-8 hover:border-accent/30 transition-colors duration-300">
              <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-accent" />
              </div>
              <div className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
                30+
              </div>
              <div className="font-sans font-medium text-muted-foreground uppercase tracking-wide text-sm">
                Klien Puas
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-xl text-center p-8 hover:border-primary/30 transition-colors duration-300">
              <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <div className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
                24 Jam
              </div>
              <div className="font-sans font-medium text-muted-foreground uppercase tracking-wide text-sm">
                Respon Cepat
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
