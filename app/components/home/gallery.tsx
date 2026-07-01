"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { getTekoData, type GalleryPhoto } from "@utils/fetcher";

function GalleryPhotoImg({ photo, index }: { photo: GalleryPhoto; index: number }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <div
        className={`absolute inset-0 bg-linear-to-br from-white/10 via-white/5 to-white/10 animate-pulse transition-opacity duration-500 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      />
      <img
        src={photo.imgUrl}
        alt={photo.caption || `Galeri Tenis Komedi ${index + 1}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`relative w-full h-full object-cover transition-all duration-700 ease-out ${
          loaded ? "opacity-100 scale-100 blur-none" : "opacity-0 scale-105 blur-md"
        }`}
      />
    </>
  );
}

export default function Gallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [desc, setDesc] = useState("");
  const [visibleIds, setVisibleIds] = useState<Set<number>>(new Set());
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    getTekoData()
      .then(({ gallery }) => {
        setPhotos(gallery?.photos ?? []);
        setDesc(gallery?.desc ?? "");
      })
      .catch((error) => console.error("Gagal memuat galeri foto:", error));
  }, []);

  // Reveal gallery photos as they scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = Number((entry.target as HTMLElement).dataset.galleryId);
          setVisibleIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    itemRefs.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [photos.length]);

  if (photos.length === 0) return null;

  return (
    <div className="px-4 md:px-8 mb-8 md:mb-12">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">📸</span>
        <h2 className="text-xl md:text-base font-black text-slate-200">Galeri Foto</h2>
      </div>
      {desc && <p className="text-xs md:text-sm text-slate-500 mb-3">{desc}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 grid-flow-dense">
        {photos.map((photo, index) => {
          const isLandscape = photo.width >= photo.height;
          return (
            <div
              key={photo.id}
              ref={(el) => { itemRefs.current[index] = el; }}
              data-gallery-id={index}
              className={`relative overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-700 ease-out ${
                visibleIds.has(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              } ${isLandscape ? "col-span-2 aspect-3/2" : "col-span-1 aspect-2/3"}`}
              style={{ transitionDelay: `${(index % 4) * 70}ms` }}
            >
              <GalleryPhotoImg photo={photo} index={index} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
