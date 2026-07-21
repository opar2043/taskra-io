const STORY_IMG =
  "https://images.unsplash.com/photo-1520390138845-fd2d229dd553?q=80&w=1200&auto=format&fit=crop&fm=webp";

const ProfessionalStoryBanner = () => {
  return (
    <section className="bg-cream rounded-3xl px-6 md:px-12 py-14 md:py-16 my-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left image */}
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 dot-grid rounded-xl opacity-70 hidden md:block" />
          <div className="frame-img -rotate-1">
            <img
              src={STORY_IMG}
              alt="Professional photographer at work"
              className="w-full h-[420px]"
            />
          </div>

          {/* Badge */}
          <div className="absolute bottom-6 left-6 bg-white px-4 py-2.5 rounded-2xl shadow-soft border border-line">
            <p className="text-sm font-bold text-ink">Taskra Verified</p>
            <p className="text-xs text-body-text">Certificate of Excellence</p>
          </div>
        </div>

        {/* Right content */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="mk-eyebrow mb-2">Community</p>
            <h2 className="mk-h2">Hear from a professional</h2>
            <p className="mk-lead mt-3">
              A journey built on passion, experience, and a love for the craft.
            </p>
          </div>

          <p className="text-sm text-body-text leading-relaxed">
            After a decade shooting commercial campaigns, I went freelance to work
            directly with the people behind each brief. Taskra connects me with
            clients who care about the story as much as the shot — from weddings
            and portraits to full brand films.
          </p>

          {/* Q&A blocks */}
          <div className="grid grid-cols-1 gap-5">
            <div className="bg-white rounded-2xl border border-line p-5">
              <h4 className="text-sm font-bold text-ink mb-2">
                What do you love most about your job?
              </h4>
              <p className="text-sm text-body-text leading-relaxed">
                Handing over a finished gallery and watching a client relive their
                day is the most fulfilling part of my work. Knowing I captured a
                moment they will keep forever is deeply rewarding.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-line p-5">
              <h4 className="text-sm font-bold text-ink mb-2">
                What inspired you to start your own business?
              </h4>
              <p className="text-sm text-body-text leading-relaxed">
                Going independent let me choose the projects I believe in and
                build real relationships with clients. Taskra makes that possible
                — steady leads, direct messaging, and payments handled in one
                place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalStoryBanner;
