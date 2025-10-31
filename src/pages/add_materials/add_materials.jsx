import React, { useEffect } from "react";
import Layout from "../../shared/components/layout";
import MaterialsGrid from "./components/materials_grid";

const AddMaterials = () => {
  useEffect(() => {
    document.title = "Materials - Dr. Omar Khalid";
  }, []);

  return (
    <Layout>
      <div className="classroom-container">
        <main className="main-content-classroom">
          <h1 className="classroom-title">Materials</h1>

          <MaterialsGrid />
        </main>
      </div>
    </Layout>
  );
};

export default AddMaterials;