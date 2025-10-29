import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AnimatedList from "../components/ui/AnimatedList";
import MemberProductCard from "../components/ui/MemberProductCard";
import AddProductPanel from "../components/ui/AddProductPanel";
import type { Member } from "../types/add-member";
import type {
  MemberProduct,
  MemberProductFormValues,
} from "../types/member-products";
import {
  MEMBERS_UPDATED_EVENT,
  loadMembersFromStorage,
} from "../utils/member-storage";
import { findMemberBySlug } from "../utils/member-path";
import {
  MEMBER_PRODUCTS_UPDATED_EVENT,
  createProductFromForm,
  loadMemberProductsFromStorage,
  mapFormValuesToProductFields,
  saveMemberProductsToStorage,
} from "../utils/member-product-storage";

type ProductFormPayload = ReturnType<typeof mapFormValuesToProductFields>;

const applyFieldsToProduct = (
  product: MemberProduct,
  fields: ProductFormPayload,
  updatedAt: string
): MemberProduct => {
  const next: MemberProduct = {
    ...product,
    name: fields.name,
    updatedAt,
  };

  const mutable = next as Record<string, unknown>;

  delete mutable.url;
  delete mutable.notes;
  delete mutable.priceDisplay;
  delete mutable.priceValue;

  if (fields.url) {
    next.url = fields.url;
  }
  if (fields.notes) {
    next.notes = fields.notes;
  }
  if (fields.priceDisplay) {
    next.priceDisplay = fields.priceDisplay;
  }
  if (fields.priceValue !== undefined) {
    next.priceValue = fields.priceValue;
  }

  return next;
};

const MemberProducts = () => {
  const { memberSlug } = useParams<{ memberSlug: string }>();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>(loadMembersFromStorage);
  const [products, setProducts] = useState<MemberProduct[]>(
    loadMemberProductsFromStorage
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MemberProduct | null>(
    null
  );

  useEffect(() => {
    const handleUpdate = () => {
      setMembers(loadMembersFromStorage());
    };
    window.addEventListener(MEMBERS_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(MEMBERS_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  useEffect(() => {
    const handleProductsUpdate = () => {
      setProducts(loadMemberProductsFromStorage());
    };
    window.addEventListener(
      MEMBER_PRODUCTS_UPDATED_EVENT,
      handleProductsUpdate
    );
    return () => {
      window.removeEventListener(
        MEMBER_PRODUCTS_UPDATED_EVENT,
        handleProductsUpdate
      );
    };
  }, []);

  const member = useMemo(() => {
    if (!memberSlug) {
      return undefined;
    }
    try {
      return findMemberBySlug(members, decodeURIComponent(memberSlug));
    } catch {
      return undefined;
    }
  }, [memberSlug, members]);

  const memberProducts = useMemo(() => {
    if (!member) {
      return [];
    }
    return products
      .filter((product) => product.memberId === member.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [products, member]);

  const totalTrackedValue = useMemo(() => {
    if (!memberProducts.length) {
      return null;
    }
    const sum = memberProducts.reduce((acc, product) => {
      if (typeof product.priceValue === "number") {
        return acc + product.priceValue;
      }
      return acc;
    }, 0);
    return Number.isFinite(sum) ? sum : null;
  }, [memberProducts]);

  const scheduleSave = useCallback((next: MemberProduct[]) => {
    if (typeof queueMicrotask === "function") {
      queueMicrotask(() => {
        saveMemberProductsToStorage(next);
      });
    } else {
      void Promise.resolve().then(() => {
        saveMemberProductsToStorage(next);
      });
    }
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setEditingProduct(null);
  }, []);

  const handleDeleteProduct = useCallback(
    (productId: string) => {
      setProducts((prev) => {
        const next = prev.filter((product) => product.id !== productId);
        scheduleSave(next);
        return next;
      });
      if (editingProduct && editingProduct.id === productId) {
        handleClosePanel();
      }
    },
    [editingProduct, handleClosePanel, scheduleSave]
  );

  const handleEditProduct = useCallback((product: MemberProduct) => {
    setEditingProduct(product);
    setIsPanelOpen(true);
  }, []);

  const handleSubmitProduct = useCallback(
    (values: MemberProductFormValues) => {
      if (!member) {
        handleClosePanel();
        return;
      }

      const fields = mapFormValuesToProductFields(values);

      if (!fields.name.trim()) {
        return;
      }

      if (editingProduct) {
        const updatedAt = new Date().toISOString();
        setProducts((prev) => {
          const next = prev.map((product) =>
            product.id === editingProduct.id
              ? applyFieldsToProduct(product, fields, updatedAt)
              : product
          );
          scheduleSave(next);
          return next;
        });
      } else {
        const newProduct = createProductFromForm(member.id, values);
        setProducts((prev) => {
          const next = [...prev.filter((product) => product.id !== newProduct.id), newProduct];
          scheduleSave(next);
          return next;
        });
      }

      handleClosePanel();
    },
    [editingProduct, member, handleClosePanel, scheduleSave]
  );

  const openCreatePanel = useCallback(() => {
    setEditingProduct(null);
    setIsPanelOpen(true);
  }, []);

  if (!memberSlug || !member) {
    return (
      <div className="flex min-h-[calc(100dvh-6rem)] flex-col items-center justify-center gap-4 text-contrast">
        <p className="text-lg font-semibold">Member not found.</p>
        <button
          type="button"
          onClick={() => navigate("/Members")}
          className="rounded-lg border border-brand/70 bg-brand px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/70 focus:ring-offset-2 focus:ring-offset-primary"
        >
          Back to Members
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 text-contrast">
        <button
          type="button"
          onClick={() => navigate("/Members")}
          className="self-start rounded-full border border-brand/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-brand shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/70 focus:ring-offset-2 focus:ring-offset-primary"
        >
          Members
        </button>

        <div className="flex min-h-[calc(98dvh-8rem)] flex-col gap-6">
          <AnimatedList<MemberProduct>
            items={memberProducts}
            showGradients={false}
            getItemKey={(product) => product.id}
            renderItem={(product, index) => (
              <MemberProductCard
                product={product}
                onRemove={handleDeleteProduct}
                onEdit={handleEditProduct}
                toneIndex={index}
              />
            )}
            onItemSelect={(product) => handleEditProduct(product)}
            className="flex-1 w-full text-contrast"
            scrollContainerClassName="min-h-[22rem] max-h-[68vh] sm:max-h-[72vh] lg:max-h-[78vh] 2xl:max-h-[82vh]"
          />
          {memberProducts.length === 0 ? (
            <p className="rounded-2xl border border-accent-2/50 bg-primary/70 px-4 py-5 text-sm text-contrast/70 shadow-sm">
              You haven&apos;t saved any products for {member.name} yet. Tap
              &ldquo;Add Product&rdquo; to capture the first idea.
            </p>
          ) : null}
          <div className="mt-auto px-3 pb-3">
            <button
              onClick={openCreatePanel}
              className="w-full rounded-xl border border-brand/70 bg-brand px-4 py-3 text-center font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/70 focus:ring-offset-2 focus:ring-offset-primary"
            >
              Add Product
            </button>
          </div>
        </div>
      </div>

      <AddProductPanel
        open={isPanelOpen}
        mode={editingProduct ? "edit" : "create"}
        editingProduct={editingProduct}
        onClose={handleClosePanel}
        onSubmit={handleSubmitProduct}
      />
    </>
  );
};

export default MemberProducts;
