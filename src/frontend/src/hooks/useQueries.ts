import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Chapter, Playlist, PlaylistItem } from "../backend.d";
import { useActor } from "./useActor";

export type { Chapter, Playlist, PlaylistItem };

export const SUBJECTS = [
  {
    id: 1n,
    name: "Biology",
    color: "bio",
    desc: "Life sciences — cells, genetics, physiology, ecology",
    chapters: 5,
  },
  {
    id: 2n,
    name: "Chemistry",
    color: "chem",
    desc: "Matter and reactions — organic, physical, inorganic",
    chapters: 4,
  },
  {
    id: 3n,
    name: "Physics",
    color: "phys",
    desc: "Forces and energy — mechanics, optics, electromagnetism",
    chapters: 4,
  },
];

export function useChaptersBySubject(subjectId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Chapter[]>({
    queryKey: ["chapters", subjectId?.toString()],
    queryFn: async () => {
      if (!actor || subjectId === null) return [];
      return actor.getChaptersBySubject(subjectId);
    },
    enabled: !!actor && !isFetching && subjectId !== null,
  });
}

export function usePlaylistsByChapter(chapterId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Playlist[]>({
    queryKey: ["playlists", chapterId?.toString()],
    queryFn: async () => {
      if (!actor || chapterId === null) return [];
      return actor.getPlaylistsByChapter(chapterId);
    },
    enabled: !!actor && !isFetching && chapterId !== null,
  });
}

export function useItemsByPlaylist(playlistId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<PlaylistItem[]>({
    queryKey: ["items", playlistId?.toString()],
    queryFn: async () => {
      if (!actor || playlistId === null) return [];
      return actor.getItemsByPlaylist(playlistId);
    },
    enabled: !!actor && !isFetching && playlistId !== null,
  });
}

export function useCreatePlaylist() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: bigint;
      chapterId: bigint;
      name: string;
      desc: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createPlaylist(
        args.id,
        args.chapterId,
        args.name,
        args.desc,
      );
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["playlists", vars.chapterId.toString()],
      });
    },
  });
}

export function useCreatePlaylistItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: bigint;
      playlistId: bigint;
      title: string;
      desc: string;
      resourceUrl: string;
      notes: string;
      order: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createPlaylistItem(
        args.id,
        args.playlistId,
        args.title,
        args.desc,
        args.resourceUrl,
        args.notes,
        args.order,
      );
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["items", vars.playlistId.toString()] });
    },
  });
}

export function useMarkItemStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      itemId: bigint;
      isCompleted: boolean;
      playlistId: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.markItemStatus(args.itemId, args.isCompleted);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["items", vars.playlistId.toString()] });
    },
  });
}

export function useSeedData() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      const seedKey = "neet_seeded_v2";
      if (localStorage.getItem(seedKey)) return;

      await Promise.all([
        actor.createSubject(
          1n,
          "Biology",
          "Life sciences — cells, genetics, physiology, ecology",
          "green",
        ),
        actor.createSubject(
          2n,
          "Chemistry",
          "Matter and reactions — organic, physical, inorganic",
          "blue",
        ),
        actor.createSubject(
          3n,
          "Physics",
          "Forces and energy — mechanics, optics, electromagnetism",
          "orange",
        ),
      ]);

      await Promise.all([
        actor.createChapter(
          101n,
          1n,
          "Cell Biology & Cell Division",
          1n,
          "Structure, function, and division of cells",
        ),
        actor.createChapter(
          102n,
          1n,
          "Genetics & Molecular Biology",
          2n,
          "Inheritance patterns, DNA, gene expression",
        ),
        actor.createChapter(
          103n,
          1n,
          "Human Physiology",
          3n,
          "Body systems, digestion, circulation, nervous system",
        ),
        actor.createChapter(
          104n,
          1n,
          "Ecology & Environment",
          4n,
          "Ecosystems, biodiversity, environmental issues",
        ),
        actor.createChapter(
          105n,
          1n,
          "Plant Biology",
          5n,
          "Photosynthesis, plant hormones, reproduction",
        ),
        actor.createChapter(
          201n,
          2n,
          "Organic Chemistry",
          1n,
          "Carbon compounds, reactions, functional groups",
        ),
        actor.createChapter(
          202n,
          2n,
          "Physical Chemistry",
          2n,
          "Thermodynamics, equilibrium, kinetics",
        ),
        actor.createChapter(
          203n,
          2n,
          "Inorganic Chemistry",
          3n,
          "Periodic table, coordination compounds, p-block",
        ),
        actor.createChapter(
          204n,
          2n,
          "Chemical Bonding",
          4n,
          "Ionic, covalent, metallic bonds, hybridisation",
        ),
        actor.createChapter(
          301n,
          3n,
          "Mechanics & Motion",
          1n,
          "Kinematics, laws of motion, work-energy theorem",
        ),
        actor.createChapter(
          302n,
          3n,
          "Optics & Wave Optics",
          2n,
          "Reflection, refraction, diffraction, interference",
        ),
        actor.createChapter(
          303n,
          3n,
          "Thermodynamics",
          3n,
          "Heat, temperature, laws of thermodynamics",
        ),
        actor.createChapter(
          304n,
          3n,
          "Electromagnetism",
          4n,
          "Electric fields, magnetic fields, electromagnetic induction",
        ),
      ]);

      await Promise.all([
        actor.createPlaylist(
          1001n,
          102n,
          "DNA Replication Master Class",
          "Complete guide to DNA replication for NEET",
        ),
        actor.createPlaylist(
          1002n,
          102n,
          "Mendelian Genetics Problems",
          "Practice problems on Mendel's laws and extensions",
        ),
        actor.createPlaylist(
          1003n,
          102n,
          "Molecular Basis of Inheritance",
          "Transcription, translation, and gene regulation",
        ),
        actor.createPlaylist(
          2001n,
          201n,
          "Named Reactions Revision",
          "All important named reactions for NEET organic",
        ),
        actor.createPlaylist(
          2002n,
          201n,
          "Functional Groups & IUPAC Naming",
          "Master IUPAC nomenclature",
        ),
        actor.createPlaylist(
          3001n,
          301n,
          "Newton's Laws — Problem Solving",
          "Step-by-step approach to force problems",
        ),
        actor.createPlaylist(
          3002n,
          301n,
          "Projectile Motion Complete",
          "All types of projectile motion problems",
        ),
      ]);

      await Promise.all([
        actor.createPlaylistItem(
          10001n,
          1001n,
          "Introduction to DNA Structure",
          "Watson-Crick model and double helix",
          "https://t.me/Pw_Lakshya_Neet_2_0_Lectures_u3m",
          "Focus on base pairing rules",
          1n,
        ),
        actor.createPlaylistItem(
          10002n,
          1001n,
          "Semi-Conservative Replication",
          "Meselson-Stahl experiment explanation",
          "https://t.me/Pw_Lakshya_Neet_2_0_Lectures_u3m",
          "Classic NEET question source",
          2n,
        ),
        actor.createPlaylistItem(
          10003n,
          1001n,
          "Enzymes in Replication",
          "Helicase, polymerase, ligase roles",
          "https://t.me/Pw_Lakshya_Neet_2_0_Lectures_u3m",
          "Remember leading vs lagging strand",
          3n,
        ),
        actor.createPlaylistItem(
          10004n,
          1001n,
          "Practice MCQs — DNA Replication",
          "50 most important MCQs for NEET",
          "https://t.me/Pw_Lakshya_Neet_2_0_Lectures_u3m",
          "Attempt all before exam",
          4n,
        ),
        actor.createPlaylistItem(
          10005n,
          1002n,
          "Laws of Segregation & Independent Assortment",
          "Mendel's pea plant experiments",
          "https://t.me/Pw_Lakshya_Neet_2_0_Lectures_u3m",
          "Monohybrid and dihybrid cross",
          1n,
        ),
        actor.createPlaylistItem(
          10006n,
          1002n,
          "Incomplete Dominance & Codominance",
          "Snapdragon flowers and ABO blood groups",
          "https://t.me/Pw_Lakshya_Neet_2_0_Lectures_u3m",
          "ABO is frequently tested",
          2n,
        ),
        actor.createPlaylistItem(
          10007n,
          1002n,
          "Sex-Linked Inheritance",
          "Colour blindness, haemophilia problems",
          "https://t.me/Pw_Lakshya_Neet_2_0_Lectures_u3m",
          "X-linked recessive pattern",
          3n,
        ),
        actor.createPlaylistItem(
          20001n,
          2001n,
          "Aldol Condensation & Cannizzaro Reaction",
          "Mechanism and applications",
          "https://t.me/Pw_Lakshya_Neet_2_0_Lectures_u3m",
          "Aldol is high weightage",
          1n,
        ),
        actor.createPlaylistItem(
          20002n,
          2001n,
          "Friedel-Crafts Alkylation & Acylation",
          "EAS mechanism on benzene ring",
          "https://t.me/Pw_Lakshya_Neet_2_0_Lectures_u3m",
          "Understand Lewis acid role",
          2n,
        ),
        actor.createPlaylistItem(
          20003n,
          2001n,
          "Diazotisation Reaction",
          "Preparation and coupling reactions",
          "https://t.me/Pw_Lakshya_Neet_2_0_Lectures_u3m",
          "Important for aromatic amines",
          3n,
        ),
        actor.createPlaylistItem(
          30001n,
          3001n,
          "Free Body Diagrams",
          "How to draw and analyse FBDs",
          "https://t.me/Pw_Lakshya_Neet_2_0_Lectures_u3m",
          "Always start with FBD",
          1n,
        ),
        actor.createPlaylistItem(
          30002n,
          3001n,
          "Friction — Static and Kinetic",
          "Concept and numerical problems",
          "https://t.me/Pw_Lakshya_Neet_2_0_Lectures_u3m",
          "Distinguish μs and μk",
          2n,
        ),
        actor.createPlaylistItem(
          30003n,
          3001n,
          "Circular Motion & Centripetal Force",
          "Vertical and horizontal circle problems",
          "https://t.me/Pw_Lakshya_Neet_2_0_Lectures_u3m",
          "Common in NEET",
          3n,
        ),
      ]);

      localStorage.setItem(seedKey, "true");
    },
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}
